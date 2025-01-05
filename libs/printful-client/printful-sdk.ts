import { utapi } from "../uploadthing";
import * as https from "https";
import {
  backpackPoints,
  bottlePoints,
  configuration,
  mugPoints,
} from "./config";
import { ProductResponseType } from "./types";
import { loadImage } from "canvas";


interface ImageDimensions {
  width: number;
  height: number;
}

async function getImageDimensions(url: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch image: ${response.statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(chunk));

        response.on("end", async () => {
          try {
            const buffer = Buffer.concat(chunks);
            const img = await loadImage(buffer);
            resolve({ width: img.width, height: img.height });
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", (error) => reject(error));
  });
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
    const imageUrl = orderDetails.imageUrl; // Get the image URL from the order details

    console.log("orderDetails for the printfull", orderDetails);

    // Ensure `recipient` and `items` are properly structured
    if (!recipient || !items || !Array.isArray(items)) {
      throw new Error("Invalid order details. Recipient and items are required.");
    }

    // Calculate the image dimensions and position
    const dimensions = await getImageDimensions(imageUrl);
    let aspectRatio = dimensions.width / dimensions.height;
    let area_width = 750; // Customize based on product area
    let area_height = 1000; // Customize based on product area
    let image_width = area_width;
    let image_height = image_width / aspectRatio;

    let height_left = area_height - image_height;
    let top = height_left / 2;

    // Prepare order data with image positioning
    const data = JSON.stringify({
      store_id: 14818720,
      recipient: {
        name: recipient.name,
        address1: recipient.address1,
        city: recipient.city,
        state_code: recipient.state_code,
        country_code: recipient.country_code,
        zip: recipient.zip,
      },
      items: items.map((item: any) => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        type: "front",
        files: item.original_image.map((file: any) => ({
          url: file.original_image,
          position: {
            area_width: area_width,
            area_height: area_height,
            width: image_width,
            height: image_height,
            top: top,
            left: 0, // Adjust left if needed
          },
        })),
      })),
    });

    const options = {
      hostname: "api.printful.com",
      path: "/orders",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Length": data.length,
      },
    };

    try {
      const response = await new Promise<any>((resolve, reject) => {
        const req = https.request(options, (res) => {
          let responseData = "";

          res.on("data", (chunk) => {
            responseData += chunk;
          });

          res.on("end", () => {
            try {
              console.log("Response Data:", responseData);  // Log the full response

              resolve(JSON.parse(responseData));
            } catch (err) {
              reject(err);
            }
          });
        });

        req.on("error", (err) => reject(err));
        req.write(data);
        req.end();
      });

      return { result: response, error: null };
    } catch (error) {
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
