import { SupabaseWrapper } from "@/database/supabase";
import { getOrderObject } from "@/libs/printful-client/getOrderObject";
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

  const IMAGE_URL =
    "https://utfs.io/f/8t9iMYLAkULvtfVP55b9HMxIfSmQ2w4nscqr9lTK0huJyCNY";
  const { height, width } = await getImageDimensions(IMAGE_URL);

  const order = getOrderObject(
    {
      image: IMAGE_URL,
      variant_id: 1,
      quantity: 1,
    },
    { height, width },
  );

  res.status(200).json({ result: { height, width }, error: null });
}
