import React, { useEffect, useState } from "react";
import { UserResource } from "@clerk/types";
import Nav from "../nav";
import { FullPageSpinner } from "../spinners/fullPageSpiner";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import { Printful } from "@/libs/printful-client/printful-sdk";
import { Product, SupabaseWrapper, Variant } from "@/database/supabase";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleDashed,
  MapPinCheckIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react";
import { Json } from "@/database/types";

interface ProductPageProps {
  id: string;
  image_id: string;
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

const ProductPage: React.FC<ProductPageProps> = ({ id, image_id, user }) => {
  // State management
  const [image, setImage] = useState<Image | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [distinctVariants, setDistinctVariants] = useState<
    DistinctVariantGroup[]
  >([]);
  const [variantMocks, setVariantMocks] = useState<Mockup[]>([]);
  const [mockupImage, setMockupImage] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedVariantGroup, setSelectedVariantGroup] =
    useState<DistinctVariantGroup | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [generatingMockup, setGeneratingMockup] = useState<boolean>(false);
  const [cartHasItems, setCartHasItems] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [rerenderNav, setRerenderNav] = useState<boolean>(false);

  // Helper functions

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
    console.log("Mockups for product:", result);
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
  ): Promise<void> => {
    const { result, error } = await database.addMockupForVariants(
      imageId,
      variantIds,
      productId,
      mock,
    );
    // setVariantMocks((prev) => [...prev, { variant_id: variantIds[0], mock }]);
    if (result)
      setVariantMocks((prev) => [...prev, { variant_id: variantIds[0], mock }]);
    if (error) throw new Error(error);
  };

  const addToCart = async (): Promise<void> => {
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
    console.log("Add to cart result:", result, error);
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
      setMockupImage(mock.mock);
      return;
    }

    setGeneratingMockup(true);
    try {
      const mockup = await getMockupImage(
        group,
        image?.image_url!,
        parseInt(id),
      );
      await addMockupToDatabase(
        parseInt(image_id),
        group.variant_ids,
        parseInt(id),
        mockup,
      );
      setMockupImage(mockup);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingMockup(false);
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
        const firstMock = fetchedMocks.find(
          (mock) => mock.variant_id === distinct[0]?.variant_ids[0],
        );

        if (firstMock) {
          setMockupImage(firstMock.mock);
        } else {
          setGeneratingMockup(true);
          console.log("Generating mockup for first variant group");
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
          setMockupImage(mockup);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setGeneratingMockup(false);
      }
    };

    if (image_id) fetchData();
  }, [image_id]);

  if (loading) return <FullPageSpinner />;

  if (!product || !image || !variants || variants.length === 0)
    return <div>Product or image not found</div>;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Nav user={user} rerender={rerenderNav} />
      <div className="flex flex-col overflow-auto">
        <div className="flex-1 flex lg:flex-row justify-center items-start mt-10  gap-6 p-6">
          <div className="flex  bg-gray-400 relative">
            <img
              src={
                generatingMockup
                  ? selectedVariantGroup?.image
                  : mockupImage || ""
              }
              onLoad={() => {
                if (selectedVariantGroup?.image !== mockupImage) {
                  // setGeneratingMockup(false);
                }
              }}
              alt="Product"
              className="max-w-[50vw] max-h-[40vw] flex  opacity-90"
            />
            {generatingMockup && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-white text-lg animate-spin">
                  <CircleDashed size={32} />
                </span>
              </div>
            )}
          </div>

          {/* Middle Section: Product Details */}
          <div className="flex flex-col ">
            <Link href={`/image/${image_id}`}>
              <button className="flex items-center text-gray-800 hover:text-gray-800 my-4">
                <IoArrowBack />
                <span>Back</span>
              </button>
            </Link>
            <h3 className="text-[#41747d] text-sm">Approved by VisualStream</h3>
            <h2 className="flex text-2xl font-medium text-[#565958] text-wrap max-w-[30vw] text-justify ">
              {product.title}
            </h2>

            <hr className="my-2  border-t-1 border-gray-400" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Price:</span>
                <p className="text-xl text-[#803d2c]">{getVariant()?.price}</p>
              </div>
              <p className="text-gray-500 mt-1">All prices include VAT</p>
            </div>

            <div className="mt-4">
              <label
                htmlFor="size"
                className="block text-sm text-[#646464]  font-medium"
              >
                Size
              </label>
              <select
                id="size"
                className="mt-1 p-2 border text-[#414342] rounded-md w-[5vw] text-sm outline-1 outline-[#6ba5b1] border-[#c2d5d9]"
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {selectedVariantGroup?.available_sizes.map((size, index) => (
                  <option key={index}>{size}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">
                Color:{" "}
                <span className="text-gray-700">
                  {selectedVariantGroup?.color_code}
                </span>
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {distinctVariants?.map((variants, index) => (
                  <img
                    key={index}
                    src={variants.image || ""}
                    alt={"variant mockup"}
                    className={`w-10 h-10 border rounded-md cursor-pointer ${
                      selectedVariantGroup?.color_code === variants.color_code
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                    onClick={() => handleColorChange(variants)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold">Product Details</h3>
              <ul className="list-none pl-0 mt-2 text-sm">
                <li className="flex">
                  <span className="w-40 font-medium text-gray-900">
                    Material composition
                  </span>
                  <span className="text-gray-700">
                    99% Polyester, 1% Elastane
                  </span>
                </li>
                <li className="flex mt-2">
                  <span className="w-40 font-medium text-gray-900">
                    Closure type
                  </span>
                  <span className="text-gray-700">Pull On</span>
                </li>
                <li className="flex mt-2">
                  <span className="w-40 font-medium text-gray-900">
                    Neck style
                  </span>
                  <span className="text-gray-700">Scoop Neck</span>
                </li>
                <li className="flex mt-2">
                  <span className="w-40 font-medium text-gray-900">
                    Sleeve type
                  </span>
                  <span className="text-gray-700">Short Sleeve</span>
                </li>
              </ul>
            </div>

            <hr className="my-6 border-t-1 border-gray-400" />

            <div>
              <h3 className="text-lg font-semibold">About this item</h3>
              <ul className="list-none pl-0 mt-2 text-sm">
                <li className="flex mt-2">
                  <span className="w-40 font-medium text-gray-900">
                    Regular Fit
                  </span>
                  <span className="text-gray-700">
                    Comfortable, easy fit through the shoulders, chest, and
                    waist
                  </span>
                </li>
                <li className="flex mt-2">
                  <span className="w-40 font-medium text-gray-900">Fabric</span>
                  <span className="text-gray-700">
                    Lightweight French Terry: Naturally soft, stretchy, and
                    breathable
                  </span>
                </li>
                <li className="flex mt-2">
                  <span className="w-40 font-medium text-gray-900">Style</span>
                  <span className="text-gray-700">
                    Lightweight and comfortable for all-day wear
                  </span>
                </li>
                <li className="flex mt-2">
                  <span className="w-40 font-medium text-gray-900">
                    Details
                  </span>
                  <span className="text-gray-700">
                    Hood, kangaroo pocket, full zipper, ribbing at cuffs and hem
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Section: Price and Actions */}
          <div className="min-w-[280px]  border border-gray-500 rounded-md p-4 shadow-md">
            <p className="text-2xl font-medium text-[#565958]">SAR203.14</p>
            <p className="text-sm mt-1 text-gray-600">
              SAR96 delivery 6-9 October
            </p>
            <button className="text-[#2e616a] font-medium mt-1 text-sm">
              Details
            </button>
            <p className="mt-2 text-sm text-[#2e616a] ">
              <MapPinCheckIcon className="h-4 w-4 inline mr-1" />
              Delivery to Riyadh{" "}
              <button className="text-[#2e616a] font-medium">
                Update Location
              </button>
            </p>
            <p className="mt-4 text-red-600 font-medium">
              Usually ships within 4 to 5 days
            </p>

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
                  className="h-10 w-full  lg:text-center p-2 border-t border-b border-gray-300 outline-1 outline-blue-500"
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
                className="w-full bg-[#fed813] text-black font-medium py-2 rounded-3xl mt-4"
                onClick={addToCart}
              >
                Add to Cart
              </button>

              {cartHasItems && (
                <Link href="/cart">
                  <button className="w-full bg-[#ffa41d] text-white font-bold py-2 rounded-3xl mt-2">
                    View Cart
                  </button>
                </Link>
              )}
            </div>

            <div className="mt-4 text-sm">
              <ul className="list-none pl-0">
                <li className="flex mt-2">
                  <span className="w-20 font-medium text-gray-900">
                    Ships from
                  </span>
                  <span className="text-[#6ba5b1]">San Diego</span>
                </li>
                <li className="flex mt-2">
                  <span className="w-20 font-medium text-gray-900">
                    Sold by
                  </span>
                  <span className="text-[#6ba5b1]">VisualStream</span>
                </li>
                <li className="flex mt-2">
                  <span className="w-20 font-medium text-gray-900">
                    Payment
                  </span>
                  <span className="text-gray-700">Secure transaction</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center mb-10">
          <div>
            {/* Title Section */}
            <div className="text-xl font-semibold mb-4">
              <h3 className="text-left">Products related to this item</h3>
            </div>

            {/* Carousel Section */}
            <div className="relative flex items-center">
              {/* Left Arrow */}
              <button className="bg-gray-300 border rounded-full shadow p-2">
                <ChevronLeftIcon />
              </button>

              {/* Carousel */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {[13, 14, 15, 16, 17].map((item) => (
                  <div
                    key={item}
                    className="flex flex-col border rounded-lg shadow-sm w-[200px] min-w-[200px] bg-white p-3"
                  >
                    <img
                      src={`/productImages/${item}.jpg`}
                      alt={`Product ${item}`}
                      className="rounded-md mb-2"
                    />
                    <p className="text-sm font-medium text-[#007185] truncate">
                      Product Title Goes Here {item}
                    </p>
                    <p className="text-sm text-gray-500">SAR 106.86</p>
                    <p className="flex items-center text-sm">
                      <span className="text-[#de7921] text-xl">★★★★☆</span>
                      <span className="text-gray-500 text-xs ml-1">(321)</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Right Arrow */}
              <button className="bg-gray-300 border rounded-full shadow p-2">
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
