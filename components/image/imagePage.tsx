import { useEffect, useRef, useState } from "react";
import { SupabaseWrapper } from "@/database/supabase";
import { Printful } from "@/libs/printful-client/printful-sdk";
import { UserResource } from "@clerk/types";
import Nav from "@/components/nav";
import { IoArrowBack } from "react-icons/io5";
import Link from "next/link";
import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { CircleDashed } from "lucide-react";
import { setPriority } from "os";

type UserPropType = {
  user: UserResource | null | undefined;
  image: Image;
};

interface Product {
  id: number;
  title: string;
  description: string;
  type_name: string;
  image: string;
  mockup: string | null;
  isLoadingMockup?: boolean; // Track loading state
}

export default function ImagePage({ user, image }: UserPropType) {
  const [products, setProducts] = useState<Product[]>([]);
  const fetchProducts = useRef(false);

  useEffect(() => {
    if (fetchProducts.current) return; // Prevent duplicate calls
    fetchProducts.current = true;

    const fetchProductsData = async () => {
      try {
        const database = new SupabaseWrapper("CLIENT");
        const client = new Printful(process.env.NEXT_PUBLIC_PRINTFUL_TOKEN!);

        // Fetch products from the database
        const { result: productsFromDB, error } = await database.getProducts();
        if (error || !productsFromDB) {
          console.error(error || "No products found");
          return;
        }

        // Initialize products with loading state
        const initialProducts = productsFromDB.map((product: Product) => ({
          ...product,
          isLoadingMockup: true,
        }));
        setProducts(initialProducts);

        // Fetch mockups for each product individually
        productsFromDB.forEach(async (product) => {
          try {
            if (product.mockup) {
              console.log(`Mockup already exists for product ID ${product.id}`);
              // Clear loading state even on error
              setProducts((prevProducts) =>
                prevProducts.map((p) =>
                  p.id === product.id ? { ...p, isLoadingMockup: false } : p,
                ),
              );
              return;
            }

            const mockup = await client.getMockupImage(
              product.image,
              image.image_url!,
              product.id,
              false,
            );

            if (!mockup) return;

            const { result, error } = await database.addMockupToProduct(
              product.id,
              mockup,
            );

            // Update the specific product when its mockup is ready
            setProducts((prevProducts) =>
              prevProducts.map((p) =>
                p.id === product.id
                  ? {
                      ...p,
                      mockup,
                      isLoadingMockup: false,
                    }
                  : p,
              ),
            );
          } catch (mockupError) {
            console.error(
              `Error fetching mockup for product ID ${product.id}:`,
              mockupError,
            );
            // Clear loading state even on error
            setProducts((prevProducts) =>
              prevProducts.map((p) =>
                p.id === product.id ? { ...p, isLoadingMockup: false } : p,
              ),
            );
          }
        });
      } catch (err) {
        console.error("Error fetching products or mockups:", err);
      }
    };

    fetchProductsData();
  }, []);

  return (
    <div className="flex flex-col lg:max-h-dvh lg:overflow-hidden font-primary">
      <Nav user={user} />
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col justify-center">
          <Link href="/">
            <button className="flex lg:hidden items-center space-x-2 text-gray-800 hover:text-gray-800 ml-[5vw] my-4">
              <IoArrowBack />
              <span>Back</span>
            </button>
          </Link>
          <img
            src={image.image_url || ""}
            alt="Image Display"
            className="w-[90vw] lg:w-[30vw] max-h-[60vh] rounded-lg object-cover m-auto"
          />
        </div>

        <div className="flex-1 p-6 lg:p-12 space-y-4 bg-white h-full max-h-[80vh] lg:overflow-y-scroll">
          <Link href="/">
            <button className="hidden lg:flex items-center space-x-2 text-gray-800 hover:text-gray-800">
              <IoArrowBack />
              <span>Back</span>
            </button>
          </Link>

          <div>
            <h1 className="text-2xl lg:text-3xl text-gray-900">
              {image.title || "Image Title"}
            </h1>
          </div>

          <p className="text-gray-600 text-left lg:w-[28vw] pt-3">
            {image.ai_describe || "Description"}
          </p>

          <div className="lg:grid grid grid-cols-4 lg:grid-cols-4 gap-4 lg:w-[30vw]">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${image.id}/${product.id}`}
              >
                <div className="w-full lg:h-30 rounded shadow overflow-hidden border-black">
                  <div className="relative w-full h-full">
                    <img
                      src={product.mockup || product.image}
                      alt={`Thumbnail for ${product.title}`}
                      className="w-full h-full object-cover"
                    />
                    {product.isLoadingMockup && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <span className="text-white text-sm animate-spin">
                          <CircleDashed size={24} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-col py-2">
            <button className="lg:w-[30vw] bg-black text-white py-3 rounded shadow hover:bg-gray-900 mb-1">
              SEE ALL PRODUCT CATEGORIES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
