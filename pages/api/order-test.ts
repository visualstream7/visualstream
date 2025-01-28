import { SupabaseWrapper } from "@/database/supabase";
import { clerkClient, currentUser, getAuth } from "@clerk/nextjs/server";
import { loadImage } from "canvas";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export interface ImageDimensions {
  width: number;
  height: number;
}

async function getImageDimensions(url: string): Promise<ImageDimensions> {
  console.log("url", url);
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const img = await loadImage(Buffer.from(buffer));
  return { width: img.width, height: img.height };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ result: null, error: "Method not allowed" });
  }

  const IMAGE_URL = "";
  const { height, width } = await getImageDimensions(IMAGE_URL);

  res.status(200).json({ result: { height, width }, error: null });
}
