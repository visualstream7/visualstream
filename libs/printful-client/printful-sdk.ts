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

  private productsConfigaration = {
    "71": {
      x: 240,
      y: 380,
      w: 225,
      h: 300,
      box_x: 0,
      box_y: 0,
      box_w: 0,
      box_h: 0,
      box_roundness: 0,
      overlay_roundness: 0,
      is_cropped: true,
    },
    "206": {
      x: 240,
      y: 330,
      w: 220,
      h: 170,
      box_x: 0,
      box_y: 0,
      box_w: 0,
      box_h: 0,
      box_roundness: 0,
      overlay_roundness: 0,
      is_cropped: true,
    },
    "380": {
      x: 240,
      y: 440,
      w: 225,
      h: 300,
      box_x: 0,
      box_y: 0,
      box_w: 0,
      box_h: 0,
      box_roundness: 0,
      overlay_roundness: 0,
      is_cropped: true,
    },
  };

  getMockupImage = async (
    product_image: string,
    overlay_image: string,
    product_id: number,
  ) => {
    if (!product_image || !overlay_image || !product_id) {
      return "";
    }

    let product_id_str = (product_id +
      "") as keyof typeof this.productsConfigaration;

    if (!this.productsConfigaration[product_id_str]) {
      return "";
    }

    const response = await fetch("/api/overlay-image", {
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
        box_roundness: this.productsConfigaration[product_id_str].box_roundness,
        overlay_roundness:
          this.productsConfigaration[product_id_str].overlay_roundness,
        is_cropped: this.productsConfigaration[product_id_str].is_cropped,
      }),
    });

    const data = await response.json();
    if (data.base64Image) return data.base64Image;
    return product_image;
  };
}

export { Printful };
