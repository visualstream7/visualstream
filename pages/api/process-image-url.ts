import { SupabaseWrapper } from "@/database/supabase";
import ColorAnalyzer from "@/libs/ColorAnalyzer/colorAnalyzer";
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

  const { image_url, id } = req.body;

  if (!image_url) {
    return res
      .status(200)
      .json({ result: null, error: "Image URL is required" });
  }

  if (!id) {
    return res.status(200).json({ result: null, error: "ID is required" });
  }

  let idInt;
  try {
    idInt = parseInt(id);
  } catch (e) {
    return res.status(200).json({ result: null, error: "Invalid ID" });
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

  let { result: imageDataSaveResult, error: imageDataSaveError } =
    await database.updateImageData(
      idInt,
      addToBucketResult.image_url,
      colorComposition,
    );

  if (imageDataSaveError) {
    return res.status(500).json({ result: null, error: imageDataSaveError });
  }

  return res.status(200).json({
    result: {
      source_image_url: image_url,
      image_data: imageDataSaveResult,
    },
    error: null,
  });
}
