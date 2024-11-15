import { SupabaseClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";

// Function to fetch an image from a URL, convert it to base64, and upload to Supabase
async function addImageToBucket(
  imageUrl: string,
  bucketName: string,
  supabase: SupabaseClient,
) {
  // Step 1: Fetch the image from the URL
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
  }

  // Step 2: Convert the image to base64
  const buffer = await response.arrayBuffer();
  const base64FileData = Buffer.from(buffer).toString("base64");

  // Step 3: Decode the base64 string to ArrayBuffer
  const decodedData = decode(base64FileData);

  const fileName = Math.random().toString(36).substring(7) + ".png";
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, decodedData, {
      contentType: "image/png",
    });

  if (error) {
    throw error;
  }

  // Step 5: Get the public URL of the uploaded file
  const storageUrl = supabase.storage.from(bucketName).getPublicUrl(fileName);
  console.log("Image uploaded successfully:", storageUrl.data.publicUrl);
  return storageUrl.data.publicUrl;
}

export { addImageToBucket };
