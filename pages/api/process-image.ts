import { SupabaseWrapper } from "@/database/supabase";
import ColorAnalyzer from "@/libs/ColorAnalyzer/colorAnalyzer";
import { NextApiRequest, NextApiResponse } from "next";

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

  let database = new SupabaseWrapper("SERVER", req, res);
  let { result, error } = await database.addImageToBucket(image_url);

  if (error || !result) {
    return res.status(500).json({ result: null, error: error });
  }

  let analyzer = new ColorAnalyzer(result.image_url);
  let colorComposition = await analyzer.getColorComposition();

  return res.status(200).json({
    result: {
      image_url: image_url,
      stored_image_url: result.image_url,
      color_composition: colorComposition,
    },
    error: null,
  });
}
