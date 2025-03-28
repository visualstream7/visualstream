import { utapi } from "../uploadthing";
import * as https from "https";
import {
  backpackPoints,
  bottlePoints,
  configuration,
  mugPoints,
  totBagPoints,
} from "./config";
import { ProductResponseType } from "./types";
import { loadImage } from "canvas";
import { getOrderObject } from "./getOrderObject";

interface ImageDimensions {
  width: number;
  height: number;
}

async function getImageDimensions(url: string): Promise<ImageDimensions> {
  console.log("url", url);
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const img = await loadImage(Buffer.from(buffer));
  return { width: img.width, height: img.height };
}

class Printful {
  private apiKey: string;
  private baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://visualstream.vercel.app/";

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Missing Printful Token");
    }
    this.apiKey = apiKey;
  }

  makeOrder = async (orderDetails: any) => {
    const token = this.apiKey; // Use the API key from the class
    const { recipient, items } = orderDetails;

    // Ensure `recipient` and `items` are properly structured
    if (!recipient || !items || !Array.isArray(items)) {
      return {
        result: null,
        error: "Invalid order details",
      };
    }

    const processItems = async (items: any[]) => {
      const itemsWithPositions = await Promise.all(
        items.map(async (item: any) => {
          const dimensions = await getImageDimensions(item.image); // Wait for dimensions
          return getOrderObject(item, dimensions);
        }),
      );

      return itemsWithPositions;
    };

    const processedItems = await processItems(items);

    // Prepare order data with image positioning
    const data = JSON.stringify({
      store_id: 14818720,
      recipient: {
        name: recipient.name,
        address1: recipient.address1,
        city: recipient.city,
        state_code: recipient.state,
        country_code: recipient.country_code,
        zip: recipient.zip,
      },
      items: processedItems,
    });

    try {
      const response = await fetch("https://api.printful.com/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      let rData = await response.json();
      return { result: rData, error: null };
    } catch (error) {
      console.error("Error during fetch:", error);
      return { result: null, error: (error as any).message };
    }
  };

  getProductsFromIds = async (product_ids: number[]) => {
    console.log("product_ids", product_ids);
    const query = fetch(`${this.baseUrl}/api/get-products-from-ids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: this.apiKey,
        product_ids: product_ids,
      }),
    });

    const response = await query;
    const data = (await response.json()) as {
      result: ProductResponseType[] | null;
      error: string | null;
    };

    return {
      result: data.result,
      error: data.error,
    };
  };

  private productsConfigaration = configuration;

  getMockupImage = async (
    product_image: string,
    overlay_image: string,
    product_id: number,
    isInternal: boolean,
    variant_id: number | null = null,
  ) => {
    if (!product_image || !overlay_image || !product_id) {
      return {
        url: null,
        base64Image: null,
      };
    }

    if (
      product_id === 19 ||
      product_id === 382 ||
      product_id === 279 ||
      product_id === 84
    ) {
      let points: any[] = [];

      if (product_id === 19) {
        points = mugPoints;
      } else if (product_id === 382) {
        points = bottlePoints;
      } else if (product_id === 279) {
        points = backpackPoints;
      } else if (product_id === 84) {
        points = totBagPoints;
      }
      const response = await fetch("/api/special-overlay-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseImageUrl: product_image,
          overlayImageUrl: overlay_image,
          points: points,
        }),
      });

      const data = await response.json();
      let url = data.url || null;
      return url;
    }

    let product_id_str = (product_id +
      "") as keyof typeof this.productsConfigaration;

    if (!this.productsConfigaration[product_id_str]) {
      return null;
    }

    const response = await fetch(
      `/api/overlay-image${isInternal ? "-internal" : ""}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_image_url: product_image,
          image_url: overlay_image,
          x: this.productsConfigaration[product_id_str].x,
          y: this.productsConfigaration[product_id_str].y,
          w: this.productsConfigaration[product_id_str].w,
          h: this.productsConfigaration[product_id_str].h,
          box_x: this.productsConfigaration[product_id_str].box_x,
          box_y: this.productsConfigaration[product_id_str].box_y,
          box_w: this.productsConfigaration[product_id_str].box_w,
          box_h: this.productsConfigaration[product_id_str].box_h,
          box_roundness:
            this.productsConfigaration[product_id_str].box_roundness,
          overlay_roundness:
            this.productsConfigaration[product_id_str].overlay_roundness,
          is_cropped: this.productsConfigaration[product_id_str].is_cropped,
        }),
      },
    );

    const data = await response.json();

    if (isInternal) return data.base64Image;
    let url = data.url || null;
    return url;
  };

  calculateShipping = async (
    recipient: {
      address1: string;
      city: string;
      country_code: string;
      state_code: string | null;
    },
    items: {
      variant_id: number;
      quantity: number;
    }[],
  ) => {
    try {
      const token = this.apiKey;

      const data = JSON.stringify({
        recipient,
        items,
        store_id: 14818720,
      });

      const response = await fetch("https://api.printful.com/shipping/rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const rData = await response.json();

      if (response.status !== 200 || !rData.result) {
        return {
          result: null,
          error: rData.error?.message || "Failed to fetch shipping rates.",
        };
      }

      const shippings = rData.result;

      if (!Array.isArray(shippings)) {
        console.error("Unexpected API response:", rData);
        return { result: null, error: "Invalid shipping rates response." };
      }

      const standard = shippings.find(
        (shipping: any) => shipping.id === "STANDARD",
      );

      if (!standard) {
        return { result: null, error: "No standard shipping available." };
      }

      const rate = parseFloat(standard.rate);

      return { result: rate, error: null };
    } catch (error) {
      console.error("Error during fetch:", error);
      return {
        result: null,
        error: (error as any).message || "Unexpected error occurred.",
      };
    }
  };

  calculateTax = async (recipient: {
    country_code: string;
    state_code: string;
    city: string;
    zip: string;
  }) => {
    try {
      const response = await fetch("https://api.printful.com/tax/rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ recipient }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch tax rates");
      }

      return { result: data.result, error: null };
    } catch (error) {
      return { result: null, error: (error as Error).message };
    }
  };
}

export { Printful };
