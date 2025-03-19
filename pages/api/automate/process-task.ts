import { SupabaseWrapper } from "@/database/supabase";
import { NextApiRequest, NextApiResponse } from "next";

// This function can run for a maximum of 5 seconds
// export const config = {
//   maxDuration: 800,
// };

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    // wait for 40 seconds

    await sleep(40000);

    return res.status(405).json({ result: null, error: "Method Not Allowed" });
  }

  return res.status(200).json({ result: "Hello World" });
}
