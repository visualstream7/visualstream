import { addLowResImage } from "@/database/functions/images/addLowResImageToDatabase";
import { SupabaseWrapper } from "@/database/supabase";
import { clerkClient, currentUser, getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let database = new SupabaseWrapper("SERVER", req, res).client;
  const id = req.query.id as string;
  const id_int = parseInt(id);
  const image_url = req.query.image_url as string;

  // return res.status(200).json({
  //   id: id_int,
  //   url: image_url,
  // });

  const { data, error } = await addLowResImage(
    id_int,
    image_url,
    "assets",
    req,
    res,
    database,
  );

  return res.status(200).json({
    result: {
      data,
    },
    error: error,
  });
}

// call this by passing the id and image_url as query parameters
// /api/update-low-res?id=1&image_url=https://example.com/image.jpg
