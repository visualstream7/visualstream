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

  const { image_url, caption, description } = req.body;


  if (!image_url) {
    return res
      .status(200)
      .json({ result: null, error: "Image URL is required" });
  }

  if (!caption) {
    return res
      .status(200)
      .json({ result: null, error: "Caption URL is required" });
  }

  if (!description) {
    return res
      .status(200)
      .json({ result: null, error: "Description URL is required" });
  }



  let database = new SupabaseWrapper("SERVER", req, res);
  let { result: addToBucketResult, error: addToBucketError } =
    await database.addImageFromUrlToAssets(image_url);

  if (addToBucketError || !addToBucketResult) {
    return res.status(500).json({ result: null, error: addToBucketError });
  }

  let analyzer = new ColorAnalyzer(addToBucketResult.image_url);
  let { result: colorComposition, error: colorCompositionError } =
    await analyzer.getColorComposition();

  if (colorCompositionError || !colorComposition) {
    return res.status(500).json({ result: null, error: colorCompositionError });
  }
  
  let { result: imageDataSaveResult, error: imageDataSaveError } = await database.addImageData(addToBucketResult.image_url, caption, description, colorComposition);
  
  if (imageDataSaveError) {
    return res.status(500).json({ result: null, error: imageDataSaveError });
  }


  return res.status(200).json({
    result: {
      image_url: image_url,
      stored_image_url: addToBucketResult.image_url,
      color_composition: colorComposition,
      image_data: imageDataSaveResult,
    },
    error: null,
  });
}
