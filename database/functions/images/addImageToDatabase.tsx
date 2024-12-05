import { Database } from "@/database/types";
import { SupabaseClient } from "@supabase/supabase-js";

interface QuantizedColor {
  color: string;
  percentage: number;
}

// Function to fetch an image from a URL, convert it to base64, and upload to Supabase
async function addImageToDatabase(
  caption: string,
  description: string,
  summary: string,
  articleUrl: string,
  category: string,
  supabase: SupabaseClient<Database>,
) {
  const { data, error } = await supabase
    .from("Images")
    .insert([
      {
        caption: caption,
        description: description,
        summary: summary,
        article_link: articleUrl,
        category: category,
      },
    ])
    .select("*");

  if (error) {
    throw new Error(`Failed to insert image data: ${error.message}`);
  }

  return data ? data[0] : null;
}

async function updateImageInDatabase(
  id: number,
  imageUrl: string,
  lowResImageUrl: string,
  colorPercentages: QuantizedColor[],
  supabase: SupabaseClient<Database>,
) {
  const { data, error } = await supabase
    .from("Images")
    .update({
      image_url: imageUrl,
      color_composition: colorPercentages as any,
      low_resolution_image_url: lowResImageUrl,
    })
    .eq("id", id)
    .select("*");

  if (error) {
    throw new Error(`Failed to insert image data: ${error.message}`);
  }

  return data ? data[0] : null;
}

export { addImageToDatabase, updateImageInDatabase };
