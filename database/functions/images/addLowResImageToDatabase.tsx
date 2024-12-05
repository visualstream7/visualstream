import { Database } from "@/database/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

import { createCanvas, loadImage } from "canvas";
import { utapi } from "@/libs/uploadthing";

// Function to fetch an image from a URL, convert it to base64, and upload to Supabase
async function addLowResImage(
  id: number,
  imageUrl: string,
  bucketName: "assets",
  supabase: SupabaseClient<Database>,
) {
  // Step 1: Fetch the image from the URL
  //
  let url = `https://resize.sardo.work/?imageUrl=${imageUrl}&width=${450}&height=${300}&quality=${50}`;

  // Get the image buffer in JPEG format
  let response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch image from URL: ${imageUrl} with status: ${response.status}`,
    );
  }

  let imageUploadResult = await utapi.uploadFilesFromUrl(url);

  if (imageUploadResult.error) {
    return {
      data: null,
      error: imageUploadResult.error,
    };
  }

  // Step 5: Get the public URL of the uploaded file
  const low_res_url = imageUploadResult.data.url;

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
