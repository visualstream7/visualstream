import { SupabaseWrapper } from "@/database/supabase";
import ColorAnalyzer from "@/libs/ColorAnalyzer/colorAnalyzer";
import { utapi } from "@/libs/uploadthing";
import { NextApiRequest, NextApiResponse } from "next";

// This function can run for a maximum of 5 seconds
export const config = {
  maxDuration: 40,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: null, error: "Method Not Allowed" });
  }

  const { image_url } = req.body;

  if (!image_url) {
    return res
      .status(200)
      .json({ result: null, error: "Image URL is required" });
  }

  let analyzer = new ColorAnalyzer(image_url, 7);

  let { result: colorComposition, error: colorCompositionError } =
    await analyzer.getColorComposition();

  if (colorCompositionError || !colorComposition) {
    return res.status(500).json({ result: null, error: colorCompositionError });
  }

  return res.status(200).json({
    result: {
      image_url: image_url,
      image_data: colorComposition,
    },
    error: null,
  });
}
