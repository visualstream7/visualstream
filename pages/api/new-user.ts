import { SupabaseWrapper } from "@/database/supabase";
import { clerkClient, currentUser, getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ result: null, error: "Unauthorized" });
  }

  // Add logic that retrieves the data for the API route
  const user = await (await clerkClient()).users.getUser(userId);

  if (!user) {
    return res.status(404).json({ result: null, error: "User not found" });
  }

  let database = new SupabaseWrapper("SERVER", req, res);

  let redirectTo = "/";
  res.redirect(redirectTo);
}
