import { SupabaseClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";

// Function to fetch an image from a URL, convert it to base64, and upload to Supabase
async function addImageToBucketFromUrl(
  imageUrl: string,
  bucketName: string,
  supabase: SupabaseClient,
) {
  // Step 1: Fetch the image from the URL
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image from URL: ${imageUrl} with status: ${response.status}`,
    );
  }

  // Step 2: Convert the image to base64
  const buffer = await response.arrayBuffer();
  const base64FileData = Buffer.from(buffer).toString("base64");

  // Step 3: Decode the base64 string to ArrayBuffer
  const decodedData = decode(base64FileData);

  // random file name of size 16
  let fileName = Math.random().toString(36).substring(2, 18) + ".png";
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, decodedData, {
      contentType: "image/png",
    });

  if (error) {
    throw new Error(`Failed to upload image to bucket: ${error.message}`);
  }

  // Step 5: Get the public URL of the uploaded file
  const storageUrl = supabase.storage.from(bucketName).getPublicUrl(fileName);
  console.log("Image uploaded successfully:", storageUrl.data.publicUrl);
  return storageUrl.data.publicUrl;
}

export { addImageToBucketFromUrl };
