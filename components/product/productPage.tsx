import React, { useEffect, useReducer, useRef, useState } from "react";
import { UserResource } from "@clerk/types";
import Nav from "../nav";
import { FullPageSpinner } from "../spinners/fullPageSpiner";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import { Printful } from "@/libs/printful-client/printful-sdk";
import { SupabaseWrapper, Variant } from "@/database/supabase";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinCheckIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react";
import { CircleDashed } from "lucide-react";
import { setPriority } from "os";
import { Json } from "@/database/types";
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

interface ProductPageProps {
  id: string;
  image_id: string;
  product_image: Image | null;
  user: UserResource | null | undefined;
}

interface DistinctVariantGroup {
  color_code: string;
  image: string;
  available_sizes: string[];
  variant_ids: number[];
}

interface Mockup {
  variant_id: number;
  mock: string;
}

type Image = {
  id: number; // bigint corresponds to number in TypeScript
  image_url?: string | null; // "text null" allows null values\
  color_composition?: Json | null; // JSON null default
  is_mock_generated?: boolean | null; // "boolean null" allows null values
  created_at: string; // Timestamp with timezone, represented as ISO string
  caption?: string | null; // Optional field, allowing null values
  ai_describe?: string | null; // Optional field, allowing null values
  article_link?: string | null; // Optional field, allowing null values
  category?: string | null; // Optional field, allowing null values
  low_resolution_image_url?: string | null; // Optional field, allowing null values
  title: string | null; // Optional field, allowing null values
};

const database = new SupabaseWrapper("CLIENT");

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

function getProductMock(product: Product, mocks: any) {
  const mockData = mocks.find((m: any) => m.product_id === product.id);
  return mockData ? mockData.mock : null;
}
const ProductDescription = ({ description }: { description: string }) => {
  // Split the input text into main description and bullet points
  const [mainDescription, ...bulletPoints] = description
    .split("•")
    .map((item) => item.trim());

  return (
    <div className="bg-white rounded-lg max-w-lg">
      {/* Main Description */}
      <p className="text-lg font-medium mb-4 text-gray-800">
        {mainDescription}
      </p>

      {/* Bullet Points */}
      <ul className="list-disc list-inside text-gray-600">
        {bulletPoints.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </div>
  );
};

const RelatedProductsCarousel = ({
  product_image,
  current_product_id,
}: {
  product_image: Image | null;
  current_product_id: number;
}) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const fetchProducts = useRef<boolean>(false);

  const [products, setProducts] = useState<Product[]>([]);

  if (!product_image) return null;

  useEffect(() => {
    if (fetchProducts.current) return; // Prevent duplicate calls
    fetchProducts.current = true;

    const fetchProductsData = async () => {
      try {
        const database = new SupabaseWrapper("CLIENT");
        const client = new Printful(process.env.NEXT_PUBLIC_PRINTFUL_TOKEN!);

        const { result: mocks, error: mocksError } =
          await database.getImageMockups(product_image.id);

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
              product_image.image_url!,
              product.id,
              false,
            );

            if (!mockup) return;

            const { result, error } = await database.addMockupForAllProducts(
              product.id,
              product_image.id,
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

    if (product_image) fetchProductsData();
  }, [product_image]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: -carouselRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: carouselRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mt-8 flex justify-center mb-10 px-2 md:px-4 w-max mx-auto max-w-[100vw] lg:max-w-[60vw]">
      <div className="w-full">
        <h3 className="text-xl font-semibold mb-4 text-left sm:ml-4 lg:ml-16">
          Products related to this item
        </h3>
        <div className="relative flex items-center gap-2">
          {/* Left Scroll Button */}
          <button
            onClick={scrollLeft}
            className="hidden md:flex bg-gray-300 border rounded-full shadow p-2"
            aria-label="Scroll Left"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto no-scrollbar w-full px-2 max-w-[80vw] no-scrollbar"
          >
            {getSortedProducts(products)
              .filter((product) => product.id !== current_product_id)
              .map((product, index) => (
                <Link
                  key={index}
                  href={`/product/${product_image.id}/${product.id}`}
                >
                  <div
                    key={index}
                    className="h-full flex cursor-pointer flex-col border rounded-lg shadow-sm w-[120px] sm:w-[150px] min-w-[120px] sm:min-w-[150px] bg-white p-3"
                  >
                    {
                      // show for puzzle
                      product.id === 534 && (
                        <img
                          src="/puzzle.png"
                          style={{
                            background: `url('${product_image?.image_url || ""}') center/150px 100px no-repeat`,
                          }}
                          alt={product.title}
                          className="m-auto w-[150px]"
                        />
                      )
                    }
                    {
                      // show for sticker
                      product.id === 358 && (
                        <div className="m-auto flex items-center">
                          <img
                            src={product_image?.image_url || ""}
                            alt="Sticker"
                            className="w-[100px] border border-[#00000010] m-auto shadow-lg p-2"
                          />
                        </div>
                      )
                    }
                    {
                      // don't show for puzzle
                      product.id !== 534 && product.id !== 358 && (
                        <img
                          src={
                            product.isLoadingMockup
                              ? product.image
                              : product.mockup || product.image
                          }
                          alt={product.title}
                          className="rounded-md m-auto"
                        />
                      )
                    }

                    {product.isLoadingMockup && (
                      <CircleDashed
                        size={32}
                        className="animate-spin text-black mx-auto"
                      />
                    )}

                    <p className="truncate text-sm font-medium text-center text-[#007185]">
                      {product.title}
                    </p>
                  </div>
                </Link>
              ))}
          </div>

          {/* Right Scroll Button */}
          <button
            onClick={scrollRight}
            className="hidden md:flex bg-gray-300 border rounded-full shadow p-2"
            aria-label="Scroll Right"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductPage: React.FC<ProductPageProps> = ({
  id,
  image_id,
  product_image,
  user,
}) => {
  // State management
  const [image, setImage] = useState<Image | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [distinctVariants, setDistinctVariants] = useState<
    DistinctVariantGroup[]
  >([]);
  const [variantMocks, setVariantMocks] = useState<Mockup[]>([]);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedVariantGroup, setSelectedVariantGroup] =
    useState<DistinctVariantGroup | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [cartHasItems, setCartHasItems] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [rerenderNav, setRerenderNav] = useState<boolean>(false);
  const [hoveredMockup, setHoveredMockup] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [hoveredGroup, setHoveredGroup] = useState<DistinctVariantGroup | null>( // Track hovered group
    null,
  );

  const { cartItems } = useCart({
    rerender: rerenderNav,
    setRerenderNav: setRerenderNav,
    user,
  });

  const getMockupOfSelectedVariant = (): Mockup | null => {
    let x =
      variantMocks.find((mock) =>
        selectedVariantGroup?.variant_ids.includes(mock.variant_id),
      ) || null;

    return x;
  };

  // get a list of unique src of mockups from variantMocks

  const getUniqueMockupSrcArray = (): string[] => {
    const mockupSrcArray = variantMocks.map((mock) => mock.mock);
    const uniqueMockupSrcArray = Array.from(new Set(mockupSrcArray));
    return uniqueMockupSrcArray;
  };

  const cacheImageSourceArray = async (): Promise<void> => {
    const uniqueMockupSrcArray = getUniqueMockupSrcArray(); // Assuming it returns an array of image URLs.

    const promises = uniqueMockupSrcArray.map((src) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = (err) => reject(err);
      });
    });

    try {
      await Promise.all(promises);
      console.log("All images cached successfully.");
    } catch (error) {
      console.error("Error caching images:", error);
    }
  };

  const fetchImage = async (): Promise<Image> => {
    const image_id_number = parseInt(image_id);
    const { result, error } = await database.getImage(image_id_number);
    if (error || !result) throw new Error(error || "No image found");
    setImage(result);
    return result;
  };

  const fetchProduct = async (): Promise<Product> => {
    const { result, error } = await database.getProduct(parseInt(id));
    if (error || !result) throw new Error(error || "No product found");
    setProduct(result);
    return result;
  };

  const fetchVariants = async (): Promise<Variant[]> => {
    const { result, error } = await database.getProductVariants(parseInt(id));
    if (error || !result) throw new Error(error || "No variants found");
    setVariants(result);
    return result;
  };

  const fetchVariantMocks = async (
    productId: number,
    imageId: number,
  ): Promise<Mockup[]> => {
    const { result, error } = await database.getAllMockupsForProduct(
      productId,
      imageId,
    );
    if (error) throw new Error(error);
    setVariantMocks(result || []);
    return result || [];
  };

  const initializeDistinctVariants = (
    variants: Variant[],
  ): DistinctVariantGroup[] => {
    const groupedVariants = variants.reduce<DistinctVariantGroup[]>(
      (acc, variant) => {
        const group = acc.find((g) => g.color_code === variant.color_code);
        if (group) {
          group.available_sizes.push(variant.size);
          group.variant_ids.push(variant.id);
        } else {
          acc.push({
            color_code: variant.color_code,
            image: variant.image,
            available_sizes: [variant.size],
            variant_ids: [variant.id],
          });
        }
        return acc;
      },
      [],
    );
    setDistinctVariants(groupedVariants);
    setSelectedSize(groupedVariants[0]?.available_sizes[0] || "");
    setSelectedVariantGroup(groupedVariants[0] || null);
    return groupedVariants;
  };

  const getMockupImage = async (
    group: DistinctVariantGroup,
    imageUrl: string,
    productId: number,
  ): Promise<string> => {
    const client = new Printful(process.env.NEXT_PUBLIC_PRINTFUL_TOKEN!);
    const mock = await client.getMockupImage(
      group.image,
      imageUrl,
      productId,
      false,
    );
    if (!mock) throw new Error("Error generating mockup image");
    return mock;
  };

  const addMockupToDatabase = async (
    imageId: number,
    variantIds: number[],
    productId: number,
    mock: string,
  ): Promise<
    | { variantIds: number[]; mock: string }
    | { variantIds: number[]; mock: null }
  > => {
    const { result, error } = await database.addMockupForVariants(
      imageId,
      variantIds,
      productId,
      mock,
    );
    if (!result || error) {
      return {
        variantIds: variantIds,
        mock: null,
      };
    }

    console.log("Mockup added to database", result);

    return {
      variantIds: variantIds,
      mock: result && result[0] ? result[0].mock : null,
    };
  };

  // handle unsigned add to cart

  const unsignedAddToCart = async (): Promise<void> => {
    let cart = localStorage.getItem("cart") || "[]";
    let cartItems = JSON.parse(cart);

    const variant = getVariant();
    if (!variant) return;

    const cartItem = cartItems.find(
      (item: any) => item.variant_id === variant.id,
    );
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItems.push({
        product_id: parseInt(id),
        variant_id: variant.id,
        image_id: parseInt(image_id),
        quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cartItems));
    setCartHasItems(true);
    setRerenderNav((prev) => !prev);
  };

  const addToCart = async (): Promise<void> => {
    // if mockup is not generated, alert user to wait
    if (!getMockupOfSelectedVariant()?.mock) {
      alert("Please wait for the mockup to be generated.");
      return;
    }

    if (!user) {
      // Handle unsigned user
      return unsignedAddToCart();
    }
    const variant = getVariant();
    if (!variant || !user?.id) return;

    const { result, error } = await database.addCartItem(
      user.id,
      parseInt(id),
      variant.id,
      parseInt(image_id),
      quantity,
    );
    if (result.length > 0) setCartHasItems(true);
    setRerenderNav((prev) => !prev);
  };

  const handleHover = async (group: DistinctVariantGroup): Promise<void> => {
    const mock = variantMocks.find((m) =>
      group.variant_ids.includes(m.variant_id),
    );

    if (mock) {
      setHoveredMockup(mock.mock);
      setHoveredGroup(group);
      return;
    }

    console.log("Hovered mockup not found in database, generating new mockup");

    try {
      setHoveredGroup(group);
      const mockup = await getMockupImage(
        group,
        image?.image_url!,
        parseInt(id),
      );
      let { mock, variantIds } = await addMockupToDatabase(
        parseInt(image_id),
        group.variant_ids,
        parseInt(id),
        mockup,
      );

      if (mock) {
        setVariantMocks((prev) => [
          ...prev,
          { variant_id: variantIds[0], mock: mock },
        ]);
      }
      console.log("Hovered mockup added to database", mock);
      setHoveredMockup(mock);
    } catch (err) {
      console.error(err);
    }
  };

  const handleColorChange = async (
    group: DistinctVariantGroup,
  ): Promise<void> => {
    setSelectedVariantGroup(group);
    if (!group.available_sizes.includes(selectedSize)) {
      setSelectedSize(group.available_sizes[0]);
    }

    const mock = variantMocks.find((m) =>
      group.variant_ids.includes(m.variant_id),
    );
    if (mock) {
      return;
    }

    try {
      const mockup = await getMockupImage(
        group,
        image?.image_url!,
        parseInt(id),
      );
      let { mock: addedMock, variantIds } = await addMockupToDatabase(
        parseInt(image_id),
        group.variant_ids,
        parseInt(id),
        mockup,
      );

      if (addedMock) {
        setVariantMocks((prev) => [
          ...prev,
          { variant_id: variantIds[0], mock: addedMock },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getVariant = (): Variant | null => {
    if (!selectedVariantGroup || !selectedSize) return null;
    return (
      variants.find(
        (variant) =>
          variant.color_code === selectedVariantGroup.color_code &&
          variant.size === selectedSize,
      ) || null
    );
  };

  useEffect(() => {
    cacheImageSourceArray();
  }, [variantMocks]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const imageResult = await fetchImage();
        const productResult = await fetchProduct();
        const variantsResult = await fetchVariants();

        setLoading(false);
        let fetchedMocks = await fetchVariantMocks(
          productResult.id,
          parseInt(image_id),
        );

        const distinct = initializeDistinctVariants(variantsResult);
        const firstMock = fetchedMocks.find((mock) =>
          distinct[0].variant_ids.includes(mock.variant_id),
        );

        if (firstMock) {
          setSelectedVariantGroup(distinct[0]);
          setVariantMocks(fetchedMocks);
          return;
        }

        const mockup = await getMockupImage(
          distinct[0],
          imageResult.image_url!,
          parseInt(id),
        );
        await addMockupToDatabase(
          parseInt(image_id),
          distinct[0].variant_ids,
          parseInt(id),
          mockup,
        );
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (image_id) fetchData();
  }, [image_id, id]);

  if (loading) return <FullPageSpinner />;

  if (!product || !image || !variants || variants.length === 0)
    return <div>Product or image not found</div>;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Nav user={user} cartCount={cartItems.length} />
      <div className="flex flex-col overflow-auto">
        <Link href={`/image/${image_id}`}>
          <button className="flex items-center text-gray-800 hover:text-gray-800 m-4 lg:hidden">
            <IoArrowBack />
            <span>Back</span>
          </button>
        </Link>
        <div className="flex-1 flex flex-col lg:flex-row justify-center items-start mt-6 gap-4 lg:gap-6 p-4 sm:p-6">
          {/* Left Section: Product Image */}
          <div className="flex relative max-w-full w-[90vw] md:w-[30vw]">
            {product.id !== 534 && product.id !== 358 && (
              <img
                src={
                  isHovering
                    ? hoveredMockup
                      ? hoveredMockup
                      : hoveredGroup?.image
                    : getMockupOfSelectedVariant()?.mock ||
                      selectedVariantGroup?.image
                }
                onLoad={() => {}}
                alt=""
                className="max-w-[40%] lg:max-w-[30vw] m-auto flex opacity-90"
              />
            )}
            {((isHovering && !hoveredMockup) ||
              (!isHovering && !getMockupOfSelectedVariant()?.mock)) &&
              product.id !== 534 &&
              product.id !== 358 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="text-white text-lg animate-spin">
                    <CircleDashed size={32} />
                  </span>
                </div>
              )}

            {
              // Puzzle image
              product.id === 534 && (
                <div className="flex items-center justify-center w-[90vw] md:w-[30vw] lg:h-[80vh]">
                  <img
                    src={"/puzzle.png"}
                    alt="Product"
                    className={`w-[400px] m-auto`}
                    style={{
                      background: `url('${product_image?.image_url || ""}') center/400px 320px no-repeat`,
                    }}
                  />
                </div>
              )
            }
            {product.id === 358 && (
              // Sticker image
              <div className="flex items-center justify-center w-[90vw] md:w-[30vw] lg:h-[80vh]">
                <img
                  src={product_image?.image_url || ""}
                  alt="Product"
                  className={`${selectedSize === "15″×3.75″" ? "w-[80%] aspect-[4/1]" : "w-[50%] aspect-square"} shadow-lg p-3 object-cover border border-[#00000010] m-auto`}
                />
              </div>
            )}
          </div>

          {/* Middle Section: Product Details */}
          <div className="flex flex-col w-full lg:w-auto flex-1">
            <Link href={`/image/${image_id}`}>
              <button className="hidden lg:flex items-center text-gray-800 hover:text-gray-800 my-4">
                <IoArrowBack />
                <span>Back</span>
              </button>
            </Link>
            <h3 className="text-[#41747d] text-sm">Approved by VisualStream</h3>
            <h2 className="text-2xl font-medium text-[#565958] text-wrap text-justify max-w-full lg:max-w-[30vw]">
              {product.title}
            </h2>

            <hr className="my-2 border-t-1 border-gray-400" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Price:</span>
                <p className="text-xl text-[#803d2c]">${getVariant()?.price}</p>
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="size"
                className="block text-sm text-[#646464] font-medium"
              >
                Size
              </label>
              <select
                id="size"
                className="mt-1 p-2 border text-[#414342] rounded-md w-full sm:w-[20vw] lg:w-[5vw] text-sm outline-1 outline-[#6ba5b1] border-[#c2d5d9]"
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {selectedVariantGroup?.available_sizes.map((size, index) => (
                  <option key={index}>{size}</option>
                ))}
              </select>
            </div>

            {selectedVariantGroup?.color_code && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">
                  Color:{" "}
                  <span className="text-gray-700">
                    {selectedVariantGroup?.color_code}
                  </span>
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {distinctVariants?.length > 1 &&
                    distinctVariants?.map((variants, index) => (
                      <img
                        key={index}
                        src={variants.image || ""}
                        alt="variant mockup"
                        className={`w-10 h-10 border-2 rounded-md cursor-pointer ${
                          selectedVariantGroup?.color_code ===
                          variants.color_code
                            ? "border-blue-800"
                            : "border-gray-300"
                        }`}
                        onClick={() => handleColorChange(variants)}
                        onMouseEnter={() => {
                          setIsHovering(true);
                          handleHover(variants);
                        }}
                        onMouseLeave={() => {
                          setIsHovering(false);
                          setHoveredMockup(null);
                        }}
                      />
                    ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-semibold">Product Details</h3>
              <ProductDescription description={product.description} />
            </div>
          </div>

          {/* Right Section: Price and Actions */}
          <div className="w-full lg:w-[50%] lg:max-w-[240px] border border-gray-500 rounded-md p-4 shadow-md">
            <button className="text-[#2e616a] font-medium mt-1 text-sm">
              Details
            </button>

            <h2 className="text-lg font-semibold mt-4 text-[#2e616a]">
              {product.title}
            </h2>

            <p className="mt-4 text-red-600 font-medium">
              {getVariant()?.price && `$${getVariant()?.price}`}
            </p>

            <p className="text-gray-500 text-sm mt-2">
              {getVariant()?.size && `Size: ${getVariant()?.size}`}
            </p>
            {getVariant()?.color_code && (
              <div className="flex items-center space-x-2 mt-2">
                <p className="text-sm text-gray-500">Color:</p>
                <div
                  style={{
                    height: "20px",
                    width: "20px",
                    borderRadius: "50%",
                    backgroundColor: getVariant()?.color_code,
                  }}
                ></div>
              </div>
            )}

            <div className="mt-4">
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-600"
              >
                Quantity
              </label>
              <div className="flex items-center mt-1">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                  className="h-10 w-10 flex items-center justify-center border rounded-l-md bg-gray-100 hover:bg-gray-200"
                >
                  <MinusIcon size={16} />
                </button>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  min="1"
                  className="h-10 flex-1 w-full sm:w-[60px] text-center p-2 border-t border-b border-gray-300 outline-1 outline-blue-500"
                  onChange={(e) =>
                    setQuantity(Math.max(Number(e.target.value), 1))
                  }
                />
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="h-10 w-10 flex items-center justify-center border rounded-r-md bg-gray-100 hover:bg-gray-200"
                >
                  <PlusIcon size={16} />
                </button>
              </div>

              <button
                className="w-full p-4 bg-[#fed813] text-black font-medium py-2 rounded-3xl mt-4"
                onClick={addToCart}
              >
                {"Add to Cart"}
              </button>

              {cartHasItems && (
                <Link href="/cart">
                  <button className="w-full bg-[#ffa41d] text-white font-bold py-2 rounded-3xl mt-2">
                    View Cart
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <RelatedProductsCarousel
          product_image={product_image}
          current_product_id={parseInt(id)}
        />
      </div>
    </div>
  );
};

export default ProductPage;
