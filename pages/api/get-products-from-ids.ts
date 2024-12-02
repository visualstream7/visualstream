import {
  ProductResponseType,
  ProductType,
  VariantType,
} from "@/libs/printful-client/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: null, error: "Method not allowed" });
  }

  const token = req?.body?.token as string | undefined;
  const product_ids = req?.body?.product_ids as number[] | undefined;

  if (!token || !product_ids) {
    return res.status(200).json({
      result: null,
      error: "Missing token : string or product_ids : number[]",
    });
  }

  let queries = product_ids.map((product_id) => {
    return fetch(`https://api.printful.com/products/${product_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  });

  const responses = await Promise.all(queries);
  console.log(responses);
  const data = await Promise.all(responses.map((response) => response.json()));

  if (data.some((d: any) => d.error)) {
    return res.status(200).json({
      result: null,
      error: "Error fetching data from Printful API",
    });
  }

  let filteredData: ProductResponseType[] = data.map(
    (apiResponse: {
      result: {
        product: ProductType;
        variants: VariantType[];
      };
    }) => ({
      id: apiResponse.result.product.id,
      type: apiResponse.result.product.type,
      description: apiResponse.result.product.description,
      type_name: apiResponse.result.product.type_name,
      title: apiResponse.result.product.title,
      variants: apiResponse.result.variants?.map((variant) => ({
        id: variant.id,
        price: variant.price,
        product_id: variant.product_id,
        size: variant.size,
        color_code: variant.color_code,
        availability_status: variant.availability_status,
        image: variant.image,
      })),
    }),
  );

  res.status(200).json({
    result: filteredData,
    error: null,
  });
}
