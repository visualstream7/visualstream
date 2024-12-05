import { SupabaseWrapper } from "@/database/supabase";
import { Printful } from "@/libs/printful-client/printful-sdk";
import { NextApiRequest, NextApiResponse } from "next";
export type TaskType = {
  image_id: number;
  product_id: number;
  variant_ids: number[];
};

async function getMockGenerationTasks(
  productIds: number[],
  image_id: number,
): Promise<{
  result: TaskType[] | null;
  error: string | null;
}> {
  let client = new Printful(process.env.NEXT_PUBLIC_PRINTFUL_TOKEN as string);
  let { result: productsWithVariants, error } =
    await client.getProductsFromIds(productIds);

  if (error || !productsWithVariants) {
    console.error("Error fetching products from Printful API", error);
    return { result: null, error: "Error fetching products from Printful API" };
  }

  type ProductType = Omit<(typeof productsWithVariants)[0], "variants">;
  type DistinctColorGroup = {
    color_code: string;
    variants: (typeof productsWithVariants)[0]["variants"];
    variant_ids: number[];
    group_length: number;
    image_id: number;
  };

  type ProductsWithDistinctColorGroups = {
    product: ProductType;
    distinctVariants: DistinctColorGroup[];
  }[];

  let productsWithDistinctColorGroups: ProductsWithDistinctColorGroups = [];

  // Group variants by color_code
  const distinctColorGroups: DistinctColorGroup[] = [];

  // Iterate over products with variants
  for (let product of productsWithVariants) {
    // Create productData (without variants)
    let productData: ProductType = {
      description: product.description,
      id: product.id,
      title: product.title,
      type: product.type,
      type_name: product.type_name,
    };

    // Iterate over product variants and group by color_code
    product.variants.forEach((variant) => {
      // Find the existing group for the current color_code
      let group = distinctColorGroups.find(
        (group) => group.color_code === variant.color_code,
      );

      // If no group exists for the color_code, create a new one
      if (!group) {
        group = {
          color_code: variant.color_code,
          variants: [],
          variant_ids: [],
          group_length: 0,
          image_id: image_id,
        };
        distinctColorGroups.push(group);
      }

      // Add the current variant to the appropriate group
      group.variants.push({
        availability_status: variant.availability_status,
        color_code: variant.color_code,
        id: variant.id,
        price: variant.price,
        product_id: variant.product_id,
        size: variant.size,
        image: variant.image,
      });

      // Add the variant id to the group
      group.variant_ids.push(variant.id);

      // update the group length
      group.group_length = group.variants.length;
    });

    // Add the product to the final structure
    productsWithDistinctColorGroups.push({
      product: productData,
      distinctVariants: distinctColorGroups,
    });
  }

  let tasks: TaskType[] = [];

  // Iterate over distinct color groups
  for (let group of distinctColorGroups) {
    tasks.push({
      image_id: group.image_id,
      product_id: group.variants[0].product_id,
      variant_ids: group.variant_ids,
    });
  }

  return {
    result: tasks,
    error: null,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: null, error: "Method Not Allowed" });
  }

  const { caption, title, ai_describe, article_link, category } = req.body;

  if (!title) {
    return res.status(200).json({ result: null, error: "Title is required" });
  }

  if (!caption) {
    return res.status(200).json({ result: null, error: "Caption is required" });
  }

  if (!category) {
    return res
      .status(200)
      .json({ result: null, error: "Category is required" });
  }

  if (!ai_describe) {
    return res
      .status(200)
      .json({ result: null, error: "Description is required" });
  }

  if (!article_link) {
    return res
      .status(200)
      .json({ result: null, error: "Article link is required" });
  }

  let database = new SupabaseWrapper("SERVER", req, res);

  let { result: imageDataSaveResult, error: imageDataSaveError } =
    await database.addImageData(
      title,
      caption,
      ai_describe,
      article_link,
      category,
    );

  if (imageDataSaveError) {
    return res.status(500).json({ result: null, error: imageDataSaveError });
  }

  let productIds = [380];

  let { result: tasks, error: tasksError } = await getMockGenerationTasks(
    productIds,
    imageDataSaveResult.id,
  );

  if (tasksError || !tasks) {
    return res.status(500).json({ result: null, error: tasksError });
  }

  let { result: addTasksResult, error: addTasksError } =
    await database.addTasks(tasks);

  if (addTasksError) {
    return res.status(500).json({ result: null, error: addTasksError });
  }

  return res.status(200).json({
    result: {
      image_data: imageDataSaveResult,
      mock_generation_tasks: tasks,
    },
    error: null,
  });
}
