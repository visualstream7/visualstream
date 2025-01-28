import { SupabaseWrapper } from "@/database/supabase";
import { getOrderObject } from "@/libs/printful-client/getOrderObject";
import { loadImage } from "canvas";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export interface ImageDimensions {
  width: number;
  height: number;
}

let NEXT_PUBLIC_PRINTFUL_TOKEN = "VEY7LvhvkCjjOtpTEtBIbaEadcdDLmaRYvLczI56";

const PRODUCTS = {
  PAPER_POSTER: 1,
  CANVAS: 3,
  MUG: 19,
  T_SHIRT: 71,
  TOTE_BAG: 84,
  PHONE_CASE: 181,
  HAT: 206,
  BAGPACK: 279,
  STICKERS: 358,
  HOODIE: 380,
  WATER_BOTTLE: 382,
  LAPTOP_SLEEVE: 394,
  SPIRAL_NOTEBOOK: 474,
  JIGSAW_PUZZLE: 534,
  METAL_PRINT: 588,
};

const PRODUCT_VARIANTS = {
  MUG_VARIANT: 1320,
  T_SHIRT_VARIANT: 4011,
  TOTE_BAG_VARIANT: 4533,
  PHONE_CASE_VARIANT: 7910,
  HAT_VARIANT: 7853,
  BAGPACK_VARIANT: 9063,
  HOODIE_VARIANT: 10774,
  WATER_BOTTLE_VARIANT: 10798,
  LAPTOP_SLEEVE_VARIANT: 10985,
  SPIRAL_NOTEBOOK_VARIANT: 12141,
  JIGSAW_PUZZLE_VARIANT: 13431,
};

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
  // const IMAGE_URL =
  //   "https://utfs.io/f/8t9iMYLAkULvZ7Y7MqNjrOEcbwCa8Jm3xhUXqpko9QvRIu0i";
  const { height, width } = await getImageDimensions(IMAGE_URL);
  const order = getOrderObject(
    {
      image: IMAGE_URL,
      product_id: PRODUCTS.BAGPACK,
      variant_id: PRODUCT_VARIANTS.BAGPACK_VARIANT,
      quantity: 1,
    },
    { height, width },
  );

  const data = JSON.stringify({
    store_id: 14818720,
    recipient: {
      name: "maruf",
      address1: "123 Main St",
      city: "Los Angeles",
      state_code: "CA",
      country_code: "US",
      zip: "90007",
    },
    items: [{ ...order }],
  });

  try {
    const response = await fetch("https://api.printful.com/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NEXT_PUBLIC_PRINTFUL_TOKEN}`,
      },
      body: data,
    });

    let rData = await response.json();
    return res.status(200).json({
      dimensions: { height, width },
      result: rData,
      order: order,
    });
  } catch (error) {
    console.error("Error during fetch:", error);
  }

  return res.status(200).json({ result: null, error: "Error during fetch" });
}
