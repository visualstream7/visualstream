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
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Add logic that retrieves the data for the API route
  const user = await (await clerkClient()).users.getUser(userId);

  if (!user) {
    return new NextResponse("User does not exist", { status: 404 });
  }

  console.log(user);

  let database = new SupabaseWrapper("SERVER", req, res);

  let redirectTo = "/";
  res.redirect(redirectTo);
}
