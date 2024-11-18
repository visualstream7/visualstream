import {
  createServerClient,
  type CookieOptions,
  serializeCookieHeader,
} from "@supabase/ssr";
import { type NextApiRequest, type NextApiResponse } from "next";
import { Database } from "./types";

function createClient(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        set(name: string, value: string, options: CookieOptions) {
          res.appendHeader(
            "Set-Cookie",
            serializeCookieHeader(name, value, options),
          );
        },
        remove(name: string, options: CookieOptions) {
          res.appendHeader(
            "Set-Cookie",
            serializeCookieHeader(name, "", options),
          );
        },
      },
    },
  );

  return supabase;
}

export { createClient };
