import { SupabaseWrapper } from "@/database/supabase";
import { Printful } from "@/libs/printful-client/printful-sdk";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: null, error: "Method Not Allowed" });
  }

  const { caption, title, ai_describe, article_link, category } = req.body;

  if (!title) {
    return res.status(200).json({ result: null, error: "Title is required" });
  }

  if (!caption) {
    return res.status(200).json({ result: null, error: "Caption is required" });
  }

  if (!category) {
    return res
      .status(200)
      .json({ result: null, error: "Category is required" });
  }

  if (!ai_describe) {
    return res
      .status(200)
      .json({ result: null, error: "Description is required" });
  }

  if (!article_link) {
    return res
      .status(200)
      .json({ result: null, error: "Article link is required" });
  }

  let database = new SupabaseWrapper("SERVER", req, res);

  let { result: imageDataSaveResult, error: imageDataSaveError } =
    await database.addImageData(
      title,
      caption,
      ai_describe,
      article_link,
      category,
    );

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
