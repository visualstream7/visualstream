import { SupabaseWrapper } from "@/database/supabase";
import { Printful } from "@/libs/printful-client/printful-sdk";
import { clerkClient, currentUser, getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: null, error: "Method not allowed" });
  }

  let { recipient, items } = req.body;

  if (!recipient || !items) {
    return res
      .status(400)
      .json({ result: null, error: "Missing recipient or items" });
  }

  const client = new Printful(process.env.NEXT_PUBLIC_PRINTFUL_TOKEN!);

  let { result, error } = await client.calculateShipping(
    {
      address1: recipient.address1,
      city: recipient.city,
      country_code: recipient.country_code,
    },
    items,
  );

  res.status(200).json({
    result,
    error,
  });
}
