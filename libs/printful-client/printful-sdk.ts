import { utapi } from "../uploadthing";
import {
  backpackPoints,
  bottlePoints,
  configuration,
  mugPoints,
} from "./config";
import { ProductResponseType } from "./types";

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

  makeOrder = async (order: any) => {};

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

    if (product_id === 19 || product_id === 382 || product_id === 279) {
      // mug
      //
      // baseImageUrl, overlayImageUrl, points
      //
      let points: any[] = [];

      if (product_id === 19) {
        points = mugPoints;
      } else if (product_id === 382) {
        points = bottlePoints;
      } else if (product_id === 279) {
        points = backpackPoints;
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
}

export { Printful };
