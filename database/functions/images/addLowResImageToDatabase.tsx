import { Database } from "@/database/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import Jimp from "jimp";

const path = "@img/sharp-darwin-arm64/sharp.node";
const sharp = require(path);

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

  // Fetch the image from the provided URL
  const image = await Jimp.read(imageUrl);

  // Resize the image to a low-res version (100x100 in this example)
  image.resize(100, 100);

  // Get the image buffer in JPEG format
  const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

  const base64FileData = Buffer.from(buffer).toString("base64");

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
