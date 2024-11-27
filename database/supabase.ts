import { NextApiRequest, NextApiResponse } from "next";
import { createClient as serverClient } from "./apiClient";
import { createClient as uiClient } from "./uiClient";
import { SupabaseClient } from "@supabase/supabase-js";
import { addUser as addUserToDatabase } from "./functions/users/addUser";
import { addTasks as addTasksToDatabase } from "./functions/tasks/addTasks";
import { addImageToBucketFromUrl as addImageToBucketFromUrl } from "./functions/images/addImageToBucket";
import {
  addImageToDatabase,
  updateImageInDatabase,
} from "./functions/images/addImageToDatabase";

import { Database } from "./types";
import { TaskType } from "@/pages/api/add-image";
import { Cat } from "lucide-react";
import {
  getImageFromDatabase,
  getImagesFromDatabase,
  Image,
} from "./functions/images/getImagesFromDatabase";

interface QuantizedColor {
  color: string;
  percentage: number;
}

// Define overload signatures for the constructor
class SupabaseWrapper {
  client: SupabaseClient<Database>;

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

  updateImageData = async (
    id: number,
    imageUrl: string,
    colorPercentage: QuantizedColor[],
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let data = await updateImageInDatabase(
        id,
        imageUrl,
        colorPercentage,
        this.client,
      );
      return {
        result: data,
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

  getImages = async (): Promise<{
    result: Image[] | null;
    error: string | null;
  }> => {
    try {
      let data = await getImagesFromDatabase(this.client);
      return {
        result: data,
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

  getImage = async (
    id: number,
  ): Promise<{
    result: Image | null;
    error: string | null;
  }> => {
    try {
      let data = await getImageFromDatabase(id, this.client);
      return {
        result: data,
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

  addImageData = async (
    caption: string,
    description: string,
    summary: string,
    article_link: string,
    category: string,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let data = await addImageToDatabase(
        caption,
        description,
        summary,
        article_link,
        category,
        this.client,
      );
      return {
        result: data,
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

  addTasks = async (
    tasks: TaskType[],
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let data = await addTasksToDatabase(tasks, this.client);
      return {
        result: data,
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

  addUser = async (
    id: string,
    email: string,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let data = await addUserToDatabase(id, email, this.client);
      return {
        result: data,
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
