import { Database, Json } from "@/database/types";
import { SupabaseClient } from "@supabase/supabase-js";

interface QuantizedColor {
  color: string;
  percentage: number;
}

export type Image = {
  id: number; // bigint corresponds to number in TypeScript
  image_url?: string | null; // "text null" allows null values\
  color_composition?: Json | null; // JSON null default
  is_mock_generated?: boolean | null; // "boolean null" allows null values
  created_at: string; // Timestamp with timezone, represented as ISO string
  caption?: string | null; // Optional field, allowing null values
  ai_describe?: string | null; // Optional field, allowing null values
  article_link?: string | null; // Optional field, allowing null values
  category?: string | null; // Optional field, allowing null values
  low_resolution_image_url?: string | null; // Optional field, allowing null values
  title: string | null; // Optional field, allowing null values
  ai_tags?: string | null; // Optional field, allowing null values
  ai_article_describe?: string | null; // Optional field, allowing null values
};

// Function to fetch an image from a URL, convert it to base64, and upload to Supabase
async function getImagesFromDatabase(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("Images").select("*");

  if (error) {
    throw new Error(`Failed to get images: ${error.message}`);
  }

  let images: Image[] = data;
  return images;
}

async function getImageFromDatabase(
  id: number,
  supabase: SupabaseClient<Database>,
) {
  const { data, error } = await supabase
    .from("Images")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error(`Failed to get images: ${error.message}`);
  }

  let image: Image = data;
  return image;
}

async function getAllFavouritesFromDatabase(
  supabase: SupabaseClient<Database>,
) {
  const { data, error } = await supabase.from("FavouriteImages").select("*");

  if (error || !data) {
    throw new Error(`Failed to get favourites: ${error.message}`);
  }

  return data;
}

export {
  getImagesFromDatabase,
  getImageFromDatabase,
  getAllFavouritesFromDatabase,
};
