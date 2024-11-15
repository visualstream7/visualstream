import { NextApiRequest, NextApiResponse } from "next";
import { createClient as serverClient } from "./apiClient";
import { createClient as uiClient } from "./uiClient";
import { SupabaseClient } from "@supabase/supabase-js";
import { addUser } from "./functions/users/addUser";
import { addImageToBucketFromUrl as addImageToBucketFromUrl } from "./functions/images/addImageToBucket";

// Define overload signatures for the constructor
class SupabaseWrapper {
  client: SupabaseClient;

  // Constructor signature for "SERVER" type, requiring req and res
  constructor(wrapperType: "SERVER", req: NextApiRequest, res: NextApiResponse);
  // Constructor signature for "CLIENT" type, not requiring req and res
  constructor(wrapperType: "CLIENT");

  constructor(
    wrapperType: "SERVER" | "CLIENT",
    req?: NextApiRequest,
    res?: NextApiResponse,
  ) {
    if (wrapperType === "SERVER") {
      if (!req || !res) {
        throw new Error(
          "req and res are required when wrapperType is 'SERVER'",
        );
      }
      this.client = serverClient(req, res);
    } else {
      this.client = uiClient();
    }
  }

  addImageFromUrlToAssets = async (
    imageUrl: string,
  ): Promise<{
    result: { image_url: string } | null;
    error: string | null;
  }> => {
    try {
      let url = await addImageToBucketFromUrl(imageUrl, "assets", this.client);
      return {
        result: { image_url: url },
        error: null,
      };
    } catch (error) {
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      return {
        result: null,
        error: message,
      };
    }
  };
}

export { SupabaseWrapper };
