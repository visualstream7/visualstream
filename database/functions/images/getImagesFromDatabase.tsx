import { Database, Json } from "@/database/types";
import { SupabaseClient } from "@supabase/supabase-js";

interface QuantizedColor {
  color: string;
  percentage: number;
}

export type Image = {
  id: number; // bigint corresponds to number in TypeScript
  image_url?: string | null; // "text null" allows null values
  color_composition?: Json | null; // JSON null default
  is_mock_generated?: boolean | null; // "boolean null" allows null values
  created_at: string; // Timestamp with timezone, represented as ISO string
  caption?: string | null; // Optional field, allowing null values
  description?: string | null; // Optional field, allowing null values
  article_link?: string | null; // Optional field, allowing null values
  summary?: string | null; // Optional field, allowing null values
  category?: string | null; // Optional field, allowing null values
  low_resolution_image_url?: string | null; // Optional field, allowing null values
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

export { getImagesFromDatabase };
