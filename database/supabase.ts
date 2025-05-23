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
  getAllFavouritesFromDatabase,
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
  margin: number;
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
  discontinued: boolean;
}

export interface Order {}

// types/category.ts (or wherever you keep your types)
export interface Category {
  id: number;
  name: string;
  displayName?: string; // Optional display name
  rssFeedUrl?: string;
  summaryPrompt?: string;
  captionPrompt?: string;
  imageTitlePrompt?: string;
  imageGenPrompt?: string;
  tagPrompt?: string;
  schedule: number;
  paused: boolean;
  priority: number;
  last_ran_at?: string;
  type?: string;
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

  addCategory = async (
    category: any,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let { data, error } = await this.client
        // @ts-ignore
        .from("categories")
        .insert([category]);
      if (error) {
        throw new Error(error.message);
      }
      return {
        result: data,
        error: null,
      };
    } catch (error) {
      console.error("Error adding category to database", error);
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      return {
        result: null,
        error: message,
      };
    }
  };

  updateCategory = async (
    id: number,
    category: any,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let { data, error } = await this.client
        // @ts-ignore
        .from("categories")
        .update(category)
        .eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
      return {
        result: data,
        error: null,
      };
    } catch (error) {
      console.error("Error updating category in database", error);
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      return {
        result: null,
        error: message,
      };
    }
  };

  getCategoryById = async (
    id: number,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let { data, error } = await this.client
        //@ts-ignore
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return {
        result: data,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching category by id", error);
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      return {
        result: null,
        error: message,
      };
    }
  };

  getClient = () => {
    return this.client;
  };

  getCategories = async (): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      // @ts-ignore
      let { data, error } = await this.client.from("categories").select("*");
      if (error) {
        throw new Error(error.message);
      }
      return {
        result: data,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching categories", error);
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      return {
        result: null,
        error: message,
      };
    }
  };

  getLatestImages = async (
    numberOfImages: number,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let { data, error } = await this.client
        .from("Images")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(numberOfImages);

      if (error) {
        throw new Error(error.message);
      }

      return {
        result: data,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching latest images", error);
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      return {
        result: null,
        error: message,
      };
    }
  };

  saveMetadata = async (
    id: string,
    metadata: any,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let { data, error } = await this.client.from("metadatas").insert({
        id: id,
        metadata: metadata,
      });

      if (error) {
        throw new Error(error.message);
      }
      return {
        result: data,
        error: null,
      };
    } catch (error) {
      console.error("Error saving metadata", error);
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      return {
        result: null,
        error: message,
      };
    }
  };

  getMetadata = async (
    id: string,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let { data, error } = await this.client
        .from("metadatas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return {
        result: data,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching metadata", error);
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      return {
        result: null,
        error: message,
      };
    }
  };

  addOrderToDatabase = async (
    order: any,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let { data, error } = await this.client
        .from("Orders")
        .insert([order])
        .select();

      if (error) {
        throw new Error(error.message);
      }
      return {
        result: data,
        error: null,
      };
    } catch (error) {
      console.error("Error adding order to database", error);
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      return {
        result: null,
        error: message,
      };
    }
  };

  //this function gets the orders of a user , takes in user id and email as parameters , if the user id is empty or null it fetches the orders with the email, otherwise it fetches the orders with the user id

  getOrders = async (
    userId: string,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let query = this.client.from("Orders").select("*").eq("user_id", userId);
      let { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }
      return {
        result: data,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching orders", error);
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      return {
        result: null,
        error: message,
      };
    }
  };

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
          margin: data[0].margin as number,
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
      let newMocks = variant_ids.map((variant_id) => {
        return {
          product_id: product_id,
          image_id: image_id,
          mock: mockup,
          variant_id: variant_id,
        };
      });

      let { data: existingMocks, error: existingMocksError } = await this.client
        .from("Mocks")
        .select("*")
        .match({
          product_id: product_id,
          image_id: image_id,
        });

      if (existingMocksError || !existingMocks) {
        return {
          result: null,
          error: "Error fetching existing mocks",
        };
      }

      let existingVariantIds = existingMocks.map((mock) => mock.variant_id);

      newMocks = newMocks.filter(
        (mock) => !existingVariantIds.includes(mock.variant_id),
      );

      let { data, error } = await this.client
        .from("Mocks")
        .upsert([...newMocks])
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

  getFavourites = async (): Promise<{
    result: any[] | null;
    error: string | null;
  }> => {
    try {
      let data = await getAllFavouritesFromDatabase(this.client);
      return {
        result: data,
        error: null,
      };
    } catch (error) {
      let message = "Unknow Error";
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
          margin: product.margin,
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
    ai_tags: string,
    ai_article_describe: string,
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
        ai_tags,
        ai_article_describe,
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
          discontinued: variant.discontinued,
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
    image_id: number,
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
        image_id,
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

  updateCartItems = async (
    user_id: string,
    items: any[],
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      let { data, error } = await this.client
        .from("Users")
        .update({ cart: { items: items } })
        .eq("id", user_id);

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

  getProductVariantMockAfterJoin = async (
    product_id: number,
    variant_id: number,
    image_id: number,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    // get product data

    const { data: productData, error: productError } = await this.client
      .from("Products")
      .select("*")
      .eq("id", product_id)
      .single();

    if (productError) {
      return {
        result: null,
        error: productError.message,
      };
    }
    // get variant data
    const { data: variantData, error: variantError } = await this.client
      .from("Variants")
      .select("*")
      .eq("id", variant_id)
      .single();

    if (variantError) {
      return {
        result: null,
        error: variantError.message,
      };
    }

    // get mock data for (product_id, image_id, variant_id)
    const { data: mockData, error: mockError } = await this.client
      .from("Mocks")
      .select("*")
      .eq("product_id", product_id)
      .eq("image_id", image_id)
      .eq("variant_id", variant_id)
      .single();

    if (mockError) {
      return {
        result: null,
        error: mockError.message,
      };
    }

    const { data: imageData, error: imageError } = await this.client
      .from("Images")
      .select("*")
      .eq("id", image_id)
      .single();

    if (imageError) {
      return {
        result: null,
        error: imageError.message,
      };
    }

    // combine all data and return (basically manually join)
    let data = {
      ...productData,
      ...variantData,
      ...mockData,
      image_url: imageData.image_url,
    };
    return {
      result: data,
      error: null,
    };
  };

  async clearCart(userId: number) {
    const { error } = await this.client
      .from("Users")
      .update({ cart: { items: [] } })
      .eq("id", userId);

    return {
      error: error,
    };
  }

  async updateProductMargin(productId: number, margin: number) {
    const { error } = await this.client
      .from("Products")
      .update({ margin })
      .eq("id", productId);
    return { error };
  }

  async getProductCharges() {
    const { data, error } = await this.client
      .from("ProductCharges")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Error fetching product charges", error);
    } else {
      console.log("Product charges fetched", data);
    }

    return { result: data, error };
  }

  async getLikedImagesWithDetails(userId: string) {
    let { result: likedImages, error: likedImagesError } =
      await this.getLikedImages(userId);

    let imageIds = likedImages?.map((image: any) => image.image_id) || [];

    let { result: images, error: imagesError } = await this.getImages();

    let likedImagesWithDetails = images?.filter((image: any) => {
      return imageIds.includes(image.id);
    });

    return { result: likedImagesWithDetails, error: likedImagesError };
  }

  async getLikedImages(userId: string) {
    const { data, error } = await this.client
      .from("FavouriteImages")
      .select("")
      .eq("user_id", userId);

    return { result: data, error };
  }

  async likeImage(userId: string, imageId: number) {
    const { data, error } = await this.client
      .from("FavouriteImages")
      .insert({ user_id: userId, image_id: imageId });

    return { result: data, error };
  }

  async unlikeImage(userId: string, imageId: number) {
    const { data, error } = await this.client
      .from("FavouriteImages")
      .delete()
      .eq("user_id", userId)
      .eq("image_id", imageId);

    return { result: data, error };
  }

  async updateProductCharges(shippingCost: number, vatPercentage: number) {
    const { data, error } = await this.client
      .from("ProductCharges")
      .update({
        shipping_cost: shippingCost,
        vat_percentage: vatPercentage,
      })
      .eq("id", 1);

    return { result: data, error };
  }

  updateVariantStatus = async (
    variantId: number,
    discontinued: boolean,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      const { data, error } = await this.client
        .from("Variants")
        .update({ discontinued: discontinued })
        .eq("id", variantId)
        .select();

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

  //deleteImage function by imageId
  deleteImage = async (
    imageId: number,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      const { data, error } = await this.client
        .from("Images")
        .delete()
        .eq("id", imageId);

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

  getFavoriteImagesByCategory = async (): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      // Fetch all favorite images with image_id
      const { data: favoriteImages, error: favoriteImagesError } =
        await this.client.from("FavouriteImages").select("image_id");

      if (favoriteImagesError) {
        throw new Error(favoriteImagesError.message);
      }

      // Fetch all images with category
      const { data: images, error: imagesError } = await this.client
        .from("Images")
        .select("id, category");

      if (imagesError) {
        throw new Error(imagesError.message);
      }

      // Process the data to count favorite images per category
      const categoryCounts = images.reduce(
        (acc: { [key: string]: number }, image: any) => {
          // Filter favorite images for this image_id
          const favoritesForImage = favoriteImages.filter(
            (fav: any) => fav.image_id === image.id,
          );
          const favoriteCount = favoritesForImage.length;

          if (favoriteCount > 0) {
            // Update count for this category
            if (!acc[image.category]) {
              acc[image.category] = 0;
            }
            acc[image.category] += favoriteCount;
          }
          return acc;
        },
        {},
      );

      // Convert the grouped counts to an array for rendering
      const result = Object.keys(categoryCounts).map((category) => ({
        category,
        count: categoryCounts[category],
      }));

      return {
        result,
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

  //delete categories form the database from categories table by category id
  deleteCategory = async (
    categoryId: number,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      const { data, error } = await this.client
        //@ts-ignore
        .from("categories")
        .delete()
        .eq("id", categoryId);

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

  getAutomateCategories = async (): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      const { data, error } = await this.client
        //@ts-ignore
        .from("categories")
        .select("*");

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

  updateCategoryPriorities(
    categories: { id: number; priority: number }[],
  ): Promise<
    {
      data: any;
      error: any;
    }[]
  > {
    const updates = categories.map((cat) =>
      this.client
        //@ts-ignore
        .from("categories")
        // @ts-ignore
        .update({ priority: cat.priority })
        .eq("id", cat.id),
    );

    return Promise.all(updates);
  }

  updateCategoryDisplayName = async (
    id: number,
    displayName: string,
  ): Promise<{
    result: any;
    error: string | null;
  }> => {
    try {
      const { data, error } = await (this.client as any)
        .from("categories")
        .update({ displayName: displayName }) // Use the correct column name
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return {
        result: data,
        error: null,
      };
    } catch (error) {
      console.error("Error updating category in database", error);
      const message = error instanceof Error ? error.message : "Unknown Error";
      return {
        result: null,
        error: message,
      };
    }
  };
}

export { SupabaseWrapper };
