import { Product, SupabaseWrapper } from "@/database/supabase";
import { Json } from "@/database/types";
import { Printful } from "@/libs/printful-client/printful-sdk";
import { ProductResponseType } from "@/libs/printful-client/types";
import { useEffect, useState } from "react";

const client = new Printful(process.env.NEXT_PUBLIC_PRINTFUL_TOKEN!);
let database = new SupabaseWrapper("CLIENT");
const productIds = [
  71, 206, 380, 358, 1, 3, 588, 534, 181, 394, 19, 382, 474, 279, 84,
];
export default function Admin() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  async function syncProducts() {
    setLoading(true);
    let fetched = await client.getProductsFromIds(productIds);

    if (fetched.error || !fetched.result) {
      console.error(fetched.error);
      setLoading(false);
      return;
    }

    console.log(fetched.result);

    let products = fetched.result.map((data) => ({
      id: data.id,
      title: data.title,
      description: data.description,
      type_name: data.type_name,
      image: data.variants[0]?.image,
      mockup: null,
    }));

    let variants = fetched.result
      .map((data) => data.variants)
      .reduce((acc, val) => acc.concat(val), []);

    console.log(products);
    let { result: productsResult, error: productsError } =
      await database.upsertProducts({
        products: products,
      });

    let { result: variantResult, error: variantError } =
      await database.upsertVariants({
        variants: variants.map((variant) => ({
          id: variant.id,
          availability: variant.availability_status as Json,
          color_code: variant.color_code,
          price: variant.price,
          product_id: variant.product_id,
          size: variant.size,
          image: variant.image,
          in_stock: variant.in_stock,
        })),
      });

    if (productsError || variantError) {
      console.error(productsError || variantError);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function fetchProducts() {
      let { result, error } = await database.getAllProducts();
      if (result) {
        setProducts(result);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h1>

        <div className="mb-6 flex justify-center">
          <button
            onClick={syncProducts}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Syncing..." : "Sync Products"}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Product List</h2>
          {products.length === 0 ? (
            <p className="text-gray-500">
              No products found. Please sync to fetch products.
            </p>
          ) : (
            <ul className="space-y-4">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <h3 className="text-lg font-medium text-gray-900">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{product.description}</p>
                  <p className="text-gray-500 text-xs">
                    Type: {product.type_name}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
