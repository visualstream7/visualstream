// @ts-nocheck
import { NextApiRequest, NextApiResponse } from "next";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: null, error: "Method Not Allowed" });
  }

  const {
    caption,
    title,
    ai_describe,
    article_link,
    category,
    ai_tags,
    ai_article_describe,
    image_url,
  } = req.body;

  if (!image_url) {
    return res.status(400).json({ error: "Missing image URL" });
  }

  try {
    const addImageResponse = await fetch(
      "https://visualstream.vercel.app/api/add-image",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption,
          title,
          ai_describe,
          article_link,
          category,
          ai_tags,
          ai_article_describe,
        }),
      },
    );

    const addImageData = await addImageResponse.json();
    const id = addImageData?.result?.image_data?.id || null;

    const processImageResponse = await fetch(
      "https://visualstream.vercel.app/api/process-image-url",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url, id }),
      },
    );

    const processImageData = await processImageResponse.json();

    return res.status(200).json({
      processedImage: processImageData,
    });
  } catch (error) {
    return res.status(500).json({ result: null, error: error.message });
  }
}
