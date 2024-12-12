import { NextApiRequest, NextApiResponse } from "next";
import { createClient as serverClient } from "./apiClient";
import { createClient as uiClient } from "./uiClient";
import { SupabaseClient } from "@supabase/supabase-js";
import { addUser as addUserToDatabase } from "./functions/users/addUser";
import {
  addImageToDatabase,
  updateImageInDatabase,
} from "./functions/images/addImageToDatabase";

import { Database, Json } from "./types";
import { Cat, VariableIcon } from "lucide-react";
import {
  getImageFromDatabase,
  getImagesFromDatabase,
  Image,
} from "./functions/images/getImagesFromDatabase";
import {
  addItemToCart,
  CartItem,
  removeItemFromCart,
} from "./functions/users/cart";

interface QuantizedColor {
  color: string;
  percentage: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  type_name: string;
  image: string;
  mockup: string | null;
}

export interface Variant {
  id: number;
  price: string;
  product_id: number;
  size: string;
  color_code: string;
  availability: Json;
  in_stock: boolean;
  image: string;
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

  getProduct = async (
    id: number,
  ): Promise<{
    result: Product | null;
    error: string | null;
  }> => {
    try {
      let { data, error } = await this.client
        .from("Products")
        .select("*")
        .eq("id", id);
      if (error || !data) {
        throw new Error(error ? error.message : "No product found");
      }

      return {
        result: {
          id: data[0].id as number,
          title: data[0].title as string,
          description: data[0].description as string,
          type_name: data[0].type_name as string,
          image: data[0].image as string,
          mockup: data[0].mockup,
        },
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

  addMockupForAllProducts = async (
    id: number,
    image_id: number,
    mockup: string,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let { error } = await this.client.from("Mocks").insert({
        product_id: id,
        image_id: image_id,
        mock: mockup,
        variant_id: -1,
      });
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

  addMockupForVariants = async (
    image_id: number,
    variant_ids: number[],
    product_id: number,
    mockup: string,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      const newMocks = variant_ids.map((variant_id) => {
        return {
          product_id: product_id,
          image_id: image_id,
          mock: mockup,
          variant_id: variant_id,
        };
      });

      let { data, error } = await this.client
        .from("Mocks")
        .insert([...newMocks])
        .select("*");

      if (error) {
        throw new Error(error.message);
      }
      return {
        result: data || null,
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

  getImageMockups = async (
    id: number,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    if (!id) {
      return {
        result: null,
        error: "No image id provided",
      };
    }
    try {
      let { data, error } = await this.client.from("Mocks").select("*").match({
        variant_id: -1,
        image_id: id,
      });
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

  async getAllMockupsForProduct(
    product_id: number,
    image_id: number,
  ): Promise<{
    result: any;
    error: string | null;
  }> {
    try {
      let { data, error } = await this.client
        .from("Mocks")
        .select("*")
        .match({
          product_id: product_id,
          image_id: image_id,
        })
        .neq("variant_id", -1);

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
  }

  getProducts = async (): Promise<{
    result: Product[] | null;
    error: string | null;
  }> => {
    try {
      let { data, error } = await this.client.from("Products").select("*");
      if (error || !data) {
        throw new Error(error ? error.message : "No product found");
      }

      return {
        result: data.map((product: any) => ({
          id: product.id,
          title: product.title,
          description: product.description,
          type_name: product.type_name,
          image: product.image,
          mockup: product.mockup,
        })),
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
      let { error: deleteError } = await this.client
        .from("Products")
        .delete()
        .neq("id", 0);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      let { error } = await this.client.from("Products").insert(products);
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

  getProductVariants = async (
    id: number,
  ): Promise<{
    result: Variant[] | null;
    error: string | null;
  }> => {
    try {
      let { data, error } = await this.client
        .from("Variants")
        .select("*")
        .eq("product_id", id);
      if (error || !data) {
        throw new Error(error ? error.message : "No variant found");
      }

      return {
        result: data.map((variant: any) => ({
          id: variant.id,
          price: variant.price,
          product_id: variant.product_id,
          size: variant.size,
          color_code: variant.color_code,
          availability: variant.availability,
          in_stock: variant.in_stock,
          image: variant.image,
        })),
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
      let { error: deleteError } = await this.client
        .from("Variants")
        .delete()
        .neq("id", 0);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      let { error } = await this.client.from("Variants").insert(variants);
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

  addCartItem = async (
    user_id: string,
    product_id: number,
    variant_id: number,
    quantity: number,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let { result, error } = await addItemToCart(
        user_id,
        product_id,
        variant_id,
        quantity,
        this.client,
      );
      if (error) {
        throw new Error(error);
      }
      return {
        result: result,
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

  removeCartItem = async (
    user_id: string,
    product_id: number,
    variant_id: number,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let { result, error } = await removeItemFromCart(
        user_id,
        product_id,
        variant_id,
        this.client,
      );

      if (error) {
        throw new Error(error);
      }

      return {
        result: result,
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

  getCartItems = async (
    user_id: string,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let { data, error } = await this.client
        .from("Users")
        .select("cart")
        .eq("id", user_id)
        .single();
      if (error) {
        throw new Error(error.message);
      }

      let cart = data?.cart as unknown as { items: CartItem[] };
      let items = cart ? cart.items : [];

      return {
        result: items,
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
