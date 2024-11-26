import { Database } from "@/database/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

import { createCanvas, loadImage } from "canvas";

export async function scaleImageToBase64(arrayBuffer: ArrayBuffer) {
  try {
    // Convert ArrayBuffer to a Buffer
    const buffer = Buffer.from(arrayBuffer);

    // Load the image from the buffer
    const img = await loadImage(buffer);

    // Create a canvas with the target size
    const canvas = createCanvas(100, 100);
    const context = canvas.getContext("2d");

    // Draw the image on the canvas, scaled to 100x100
    context.drawImage(img, 0, 0, 100, 100);

    // Convert the canvas content to a Base64 string
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error scaling image:", error);
    return null;
  }
}

// Function to fetch an image from a URL, convert it to base64, and upload to Supabase
async function addLowResImage(
  id: number,
  imageUrl: string,
  bucketName: "assets",
  supabase: SupabaseClient<Database>,
) {
  // Step 1: Fetch the image from the URL
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image from URL: ${imageUrl} with status: ${response.status}`,
    );
  }

  // Get the image buffer in JPEG format
  let buffer = await response.arrayBuffer();
  const base64FileData = await scaleImageToBase64(buffer);

  if (!base64FileData)
    return {
      data: null,
      error: " Failed to convert image to base64",
    };

  // Step 3: Decode the base64 string to ArrayBuffer
  const decodedData = decode(base64FileData);

  // random file name of size 16
  let fileName = Math.random().toString(36).substring(2, 18) + "_low_res.png";
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, decodedData, {
      contentType: "image/png",
    });

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  // Step 5: Get the public URL of the uploaded file
  const low_res_url = supabase.storage.from(bucketName).getPublicUrl(fileName)
    .data.publicUrl;

  const { data, error: updateError } = await supabase
    .from("Images")
    .update({
      low_resolution_image_url: low_res_url,
    })
    .eq("id", id)
    .select("*");

  return {
    data: data,
    error: updateError ? updateError.message : null,
  };
}

export { addLowResImage };
