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
  let highResUpload = null;
  let lowResUpload = null;

  if (!image_url.includes("utfs.io")) {
    highResUpload = await utapi.uploadFilesFromUrl(image_url);
  } else {
    highResUpload = {
      data: {
        url: image_url,
      },
    };
  }

  if (highResUpload.error) {
    return res.status(500).json({
      result: null,
      error: highResUpload.error,
    });
  }

  let url = `https://visualstream.vercel.app/api/resize?imageUrl=${highResUpload.data.url}&width=${450}&height=${300}&quality=${50}`;
  lowResUpload = await utapi.uploadFilesFromUrl(url);

  if (lowResUpload.error)
    return res.status(500).json({
      result: null,
      error: lowResUpload.error,
    });

  let analyzer = new ColorAnalyzer(lowResUpload.data.url);

  let { result: colorComposition, error: colorCompositionError } =
    await analyzer.getColorComposition();

  console.log("colorComposition", colorComposition);
  console.log("colorCompositionError", colorCompositionError);

  if (colorCompositionError || !colorComposition) {
    return res.status(500).json({ result: null, error: colorCompositionError });
  }

  let { result: imageDataSaveResult, error: imageDataSaveError } =
    await database.updateImageData(
      idInt,
      highResUpload.data.url,
      lowResUpload.data.url,
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
