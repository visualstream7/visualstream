import { Database } from "@/database/types";
import { SupabaseClient } from "@supabase/supabase-js";

interface QuantizedColor {
  color: string;
  percentage: number;
}

// Function to fetch an image from a URL, convert it to base64, and upload to Supabase
async function addImageToDatabase(
  title: string,
  caption: string,
  ai_describe: string,
  articleUrl: string,
  category: string,
  ai_tags: string,
  ai_article_describe: string,
  supabase: SupabaseClient<Database>,
) {
  const { data, error } = await supabase
    .from("Images")
    .insert([
      {
        title: title,
        caption: caption,
        ai_describe: ai_describe,
        article_link: articleUrl,
        category: category,
        ai_tags: ai_tags,
        ai_article_describe: ai_article_describe,
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
