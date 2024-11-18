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

  const { caption, description, summary, article_link } = req.body;
  if (!caption) {
    return res.status(200).json({ result: null, error: "Caption is required" });
  }

  if (!description) {
    return res
      .status(200)
      .json({ result: null, error: "Description is required" });
  }

  if (!summary) {
    return res.status(200).json({ result: null, error: "Summary is required" });
  }

  if (!article_link) {
    return res
      .status(200)
      .json({ result: null, error: "Article link is required" });
  }

  let database = new SupabaseWrapper("SERVER", req, res);

  let { result: imageDataSaveResult, error: imageDataSaveError } =
    await database.addImageData(caption, description, summary, article_link);

  if (imageDataSaveError) {
    return res.status(500).json({ result: null, error: imageDataSaveError });
  }

  return res.status(200).json({
    result: {
      image_data: imageDataSaveResult,
    },
    error: null,
  });
}
