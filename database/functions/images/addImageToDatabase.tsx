import { SupabaseClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";

interface QuantizedColor {
  color: string;
  percentage: number;
}

// Function to fetch an image from a URL, convert it to base64, and upload to Supabase
async function addImageToDatabase(
  imageUrl: string,
  caption: string,
  description: string,
  colorPercentage: QuantizedColor[],
  supabase: SupabaseClient,
) {

  const { data, error } = await supabase.from("Images").insert([
    {
      image_url: imageUrl,
      caption: caption,
      description: description,
      color_composition: {
        composition: colorPercentage,
      }
    }
  ])
    .select("*");

  if (error) {
    throw new Error(`Failed to insert image data: ${error.message}`);
  }
  
  return data ? data[0] : null;



}

export { addImageToDatabase };
