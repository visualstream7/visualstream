import { useEffect, useRef, useState } from "react";
import { SupabaseWrapper, Product as dbProduct } from "@/database/supabase";
import { Printful } from "@/libs/printful-client/printful-sdk";
import { UserResource } from "@clerk/types";
import Nav from "@/components/nav";
import { IoArrowBack } from "react-icons/io5";
import Link from "next/link";
import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { CircleDashed } from "lucide-react";
import useCart from "../nav/useCart";

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

function extract_type_name(product: Product | null): string | null {
  if (!product) return null;
  let typename = product.type_name;
  // remove (in) from the typename
  if (typename.includes("(in)")) {
    typename = typename.replace("(in)", "");
  }
  return typename;
}

function getSortedProducts(products: Product[]): Product[] {
  // Define the desired sort order based on product IDs
  const sortOrder: number[] = [
    206, // Hat
    380, // Hoodie
    71, // T-Shirt
    279, // All-Over Print Backpack
    474, // Spiral Notebook
    19, // Mug
    181, // iPhone Case
    382, // Stainless Steel Water Bottle
    84, // All-Over Print Tote Bag
    1, // Enhanced Matte Paper Poster (in)
    588, // Glossy Metal Print
    3, // Canvas
    358, // Kiss Cut Stickers (in)
    534, // Jigsaw Puzzle
    394, // Laptop Sleeve
  ];

  // Create a map for quick lookup of the sort order position based on ID
  const orderMap: { [key: number]: number } = {};
  sortOrder.forEach((id, index) => {
    orderMap[id] = index;
  });

  // Sort the products based on the orderMap (which is based on their ID)
  return products.sort((a, b) => {
    const aOrder = orderMap[a.id];
    const bOrder = orderMap[b.id];

    // If both products are found in the order map, compare them by their order
    if (aOrder !== undefined && bOrder !== undefined) {
      return aOrder - bOrder;
    }

    // If any of the products is not in the orderMap, put it at the end
    return aOrder === undefined ? 1 : -1;
  });
}

function getProductFromMock(mock: string, products: Product[]): Product | null {
  return products.find((product) => product.mockup === mock) || null;
}

function ImageComponent({
  hoveredImage,
  image,
}: {
  hoveredImage: string | null;
  image: Image;
}) {
  const [displayedImage, setDisplayedImage] = useState(image.image_url);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!hoveredImage) {
      setDisplayedImage(image.image_url || "");
      setIsFading(false);
    } else if (hoveredImage !== displayedImage) {
      setIsFading(true);
      const fadeTimeout = setTimeout(() => {
        setDisplayedImage(hoveredImage || image.image_url || "");
        setIsFading(false);
      }, 100); // Match the transition duration

      return () => clearTimeout(fadeTimeout);
    }
  }, [hoveredImage]);

  return (
    <img
      src={displayedImage || image.image_url || ""}
      alt="Image Display"
      className={`
        rounded-lg object-cover m-auto
        ${hoveredImage ? "h-[60vh]" : "w-[90vw] lg:max-w-[30vw] max-h-[60vh]"}
        transition-all duration-100 ease-in-out
        ${isFading ? "opacity-0" : "opacity-100"}
      `}
    />
  );
}

function getProductMock(product: Product, mocks: any) {
  const mockData = mocks.find((m: any) => m.product_id === product.id);
  return mockData ? mockData.mock : null;
}

export default function
  ImagePage({ user, image }: UserPropType) {
  const [products, setProducts] = useState<Product[]>([]);
  const fetchProducts = useRef(false);

  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  useEffect(() => {
    if (fetchProducts.current) return; // Prevent duplicate calls
    fetchProducts.current = true;

    const fetchProductsData = async () => {
      try {
        const database = new SupabaseWrapper("CLIENT");
        const client = new Printful(process.env.NEXT_PUBLIC_PRINTFUL_TOKEN!);

        const imageId = image.id;
        const { result: mocks, error: mocksError } =
          await database.getImageMockups(imageId);

        // Fetch products from the database
        const { result: productsFromDB, error } = await database.getProducts();
        if (error || !productsFromDB) {
          console.error(error || "No products found");
          return;
        }

        // Initialize products with loading state
        const initialProducts = productsFromDB.map((product: dbProduct) => ({
          ...product,
          isLoadingMockup: true,
          mockup: null,
        })) as Product[];
        setProducts(initialProducts);

        // Fetch mockups for each product individually
        initialProducts.forEach(async (product) => {
          try {
            let productMock = getProductMock(product, mocks);
            if (productMock) {
              // console.log(`Mockup already exists for product ID ${product.id}`);
              // Clear loading state even on error
              setProducts((prevProducts) =>
                prevProducts.map((p) =>
                  p.id === product.id
                    ? { ...p, isLoadingMockup: false, mockup: productMock }
                    : p,
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

            const { result, error } = await database.addMockupForAllProducts(
              product.id,
              image.id,
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

  const { count } = useCart({
    rerender: true,
    user: user,
    setRerenderNav: () => {},
  });

  return (
    <div className="flex flex-col lg:max-h-dvh overflow-hidden mb-[40px] md:mb-0 font-primary">
      <Nav user={user} cartCount={count} />
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col justify-center items-center">
          <Link href="/">
            <button className="flex lg:hidden items-center  text-gray-800 hover:text-gray-800 my-4 w-[90vw]">
              <IoArrowBack />
              <span>Back</span>
            </button>
          </Link>
          {getProductFromMock(hoveredImage!, products)?.id !== 534 &&
            getProductFromMock(hoveredImage!, products)?.id !== 358 && (
              <ImageComponent hoveredImage={hoveredImage} image={image} />
            )}
          {
            // Jigsaw Puzzle image
            getProductFromMock(hoveredImage!, products)?.id === 534 && (
              <div className="w-[90vw] lg:max-w-[30vw] h-[60vh] m-auto  flex items-center">
                <img
                  src="/puzzle.png"
                  style={{
                    background: `url('${image.image_url || ""}') center/400px 320px no-repeat`,
                  }}
                  alt="Jigsaw Puzzle"
                  className="w-[400px] m-auto"
                />
              </div>
            )
          }
          {
            // Sticker image
            getProductFromMock(hoveredImage!, products)?.id === 358 && (
              <div className="w-[90vw] lg:max-w-[30vw] h-[60vh] m-auto flex items-center">
                <img
                  src={image.image_url || ""}
                  alt="Sticker"
                  className="w-[20vw] border border-[#00000010] m-auto shadow-lg p-3"
                />
              </div>
            )
          }

          {hoveredImage && (
            <h2 className="text-2xl text-gray-900 text-center m-4 lg:w-[30vw]">
              {extract_type_name(getProductFromMock(hoveredImage, products))}
            </h2>
          )}
          {!hoveredImage && (
            <p className="text-gray-600 text-left m-4 lg:m-0 lg:w-[30vw] h-[100px] overflow-auto">
              {image.ai_article_describe || "Description"}
            </p>
          )}
        </div>

        <div className="flex-1 p-6 lg:p-12 space-y-4 bg-white h-[86vh] lg:overflow-y-hidden flex flex-col">
          <Link href="/">
            <button className="hidden lg:flex items-center space-x-2 text-gray-800 hover:text-gray-800">
              <IoArrowBack />
              <span>Back</span>
            </button>
          </Link>

          <div>
            <h1 className="truncate text-2xl lg:text-3xl text-gray-900">
              {image.title || "Image Title"}
            </h1>
          </div>

          <div
            className="
            flex
            lg:grid grid-cols-2 lg:grid-cols-5 gap-4 lg:w-full overflow-y-scroll p-2  md:p-8 custom-scrollbar"
            onMouseLeave={() => setHoveredImage(null)}
          >
            {getSortedProducts(products).map((product) => (
              <Link
                key={product.id}
                href={`/product/${image.id}/${product.id}`}
              >
                <div
                  className="w-full min-w-[150px] lg:min-w-[100px] rounded shadow-sm lg:shadow-md min-h-full overflow-hidden border border-gray-200 p-4 items-center justify-between flex flex-col gap-4"
                  onMouseEnter={() => setHoveredImage(product.mockup)}
                >
                  <div className="relative w-full h-full min-h-max my-auto">
                    {product.id !== 534 && product.id !== 358 && (
                      <img
                        src={product.mockup || product.image}
                        alt={`Thumbnail for ${product.title}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {product.id === 534 && (
                      <img
                        src="/puzzle.png"
                        style={{
                          background: `url('${image.image_url || ""}') center/150px 110px no-repeat`,
                        }}
                        alt={product.title}
                        className="w-[150px]"
                      />
                    )}

                    {product.id === 358 && (
                      <div className="w-[90%] border border-[#00000010] m-auto shadow-lg p-2">
                        <img
                          src={image.image_url || ""}
                          alt="Sticker"
                          className="w-full"
                        />
                      </div>
                    )}

                    {product.isLoadingMockup &&
                      product.id !== 534 &&
                      product.id !== 358 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="text-white text-sm animate-spin">
                            <CircleDashed size={24} />
                          </span>
                        </div>
                      )}
                  </div>
                  <p className="text-xs font-semibold text-center">
                    {extract_type_name(product)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
