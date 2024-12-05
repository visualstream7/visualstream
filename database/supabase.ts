import { NextApiRequest, NextApiResponse } from "next";
import { createClient as serverClient } from "./apiClient";
import { createClient as uiClient } from "./uiClient";
import { SupabaseClient } from "@supabase/supabase-js";
import { addUser as addUserToDatabase } from "./functions/users/addUser";
import { addTasks as addTasksToDatabase } from "./functions/tasks/addTasks";
import {
  addImageToDatabase,
  updateImageInDatabase,
} from "./functions/images/addImageToDatabase";

import { Database, Json } from "./types";
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

export interface Product {
  id: number;
  title: string;
  description: string;
  type_name: string;
}

export interface Variant {
  id: number;
  price: string;
  product_id: number;
  size: string;
  color_code: string;
  availability: Json;
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

  updateImageData = async (
    id: number,
    imageUrl: string,
    lowReslutionImageUrl: string,
    colorPercentage: QuantizedColor[],
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let data = await updateImageInDatabase(
        id,
        imageUrl,
        lowReslutionImageUrl,
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
    title: string,
    caption: string,
    ai_describe: string,
    article_link: string,
    category: string,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let data = await addImageToDatabase(
        title,
        caption,
        ai_describe,
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

  upsertProducts = async ({
    products,
  }: {
    products: Product[];
  }): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let { error } = await this.client.from("Products").upsert(products);
      if (error) {
        throw new Error(error.message);
      }
      return {
        result: null,
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

  upsertVariants = async ({
    variants,
  }: {
    variants: Variant[];
  }): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let { error } = await this.client.from("Variants").upsert(variants);
      if (error) {
        throw new Error(error.message);
      }
      return {
        result: null,
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

  getAllProducts = async (): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let { data, error } = await this.client.from("Products").select("*");
      if (error) {
        throw new Error(error.message);
      }
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
