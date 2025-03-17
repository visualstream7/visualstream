import { SupabaseWrapper } from "@/database/supabase";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ result: null, error: "Method Not Allowed" });
  }

  return res.status(200).json({ result: "Hello World" });
}
