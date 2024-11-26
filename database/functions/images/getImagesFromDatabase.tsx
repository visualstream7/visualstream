import { Database } from "@/database/types";
import { SupabaseClient } from "@supabase/supabase-js";

interface QuantizedColor {
  color: string;
  percentage: number;
}

interface Image {
  caption: string;
  description: string;
  summary: string;
  articleUrl: string;
  category: string;
}

// Function to fetch an image from a URL, convert it to base64, and upload to Supabase
async function getImagesFromDatabase(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("Images").select("*");

  if (error) {
    throw new Error(`Failed to get images: ${error.message}`);
  }

  return data ? data : [];
}

export { getImagesFromDatabase };
