import { SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Product, SupabaseWrapper, Variant } from "@/database/supabase";
import { FullPageSpinner } from "@/components/spinners/fullPageSpiner";

const database = new SupabaseWrapper("CLIENT");

interface DistinctVariantGroup {
  product_id: number;
  size: string;
  variants: Variant[];
}

function Modal({
  setIsModalOpen,
  onSave,
  productId,
}: {
  setIsModalOpen: (value: boolean) => void;
  onSave: (margin: number) => void;
  productId: number;
}) {
  const [margin, setMargin] = useState("");

  const handleSave = async () => {
    const marginValue = parseFloat(margin);
    if (!isNaN(marginValue)) {
      try {
        const { error } = await database.updateProductMargin(
          productId,
          marginValue,
        );
        if (error) {
          console.error("Error updating margin:", error);
          return;
        }
        onSave(marginValue);
        setIsModalOpen(false);
      } catch (err) {
        console.error("Unexpected error updating margin:", err);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setIsModalOpen(false)}
    >
      <div
        className="bg-white p-4 rounded-md shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">Set Margin Percentage</h2>
        <input
          type="number"
          value={margin}
          onChange={(e) => setMargin(e.target.value)}
          className="border p-2 rounded-md w-full mb-4"
          placeholder="Enter margin percentage"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleSave}
            className="bg-[#3b4a5e] text-white px-4 py-2 rounded-md"
          >
            Save
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-gray-300 text-black px-4 py-2 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ProductCard Component
function ProductCard({
  product,
  variantGroups,
  setVariantGroups,
}: {
  product: Product;
  variantGroups: DistinctVariantGroup[];
  setVariantGroups: any;
}) {
  const [selectedSize, setSelectedSize] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [margin, setMargin] = useState<number | null>(product.margin);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null,
  );

  const getProductSizes = (product_id: number) => {
    if (!variantGroups) return [];
    return variantGroups
      .filter((group) => group.product_id === product_id)
      .map((group) => group.size);
  };

  const getVariantsOfGroup = (product_id: number, size: string) => {
    if (!variantGroups) return [];
    let variants = variantGroups
      .filter((group) => group.product_id === product_id && group.size === size)
      .map((group) => group.variants);

    let variant = variants[0];

    if (!variant) return [];

    // map the variants to create an array of { color, variant_id }

    return variant.map((v) => {
      return {
        color: v.color_code,
        variant_id: v.id,
        discontinued: v.discontinued,
      };
    });
  };

  function isVariantDiscontinued(variant_id: number) {
    if (!variantGroups) return false;
    return (
      variantGroups
        .filter((group) => group.product_id === product.id)
        .map((group) => group.variants)
        .flat()
        .find((variant) => variant.id === variant_id)?.discontinued || false
    );
  }

  const getProductPrice = (product_id: number, size: string) => {
    if (!variantGroups) return null;
    const price = variantGroups
      .filter((group) => group.product_id === product_id && group.size === size)
      .map((group) => group.variants[0].price);
    return price.length > 0 ? parseFloat(price[0]) : null;
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value;
    setSelectedSize(size);
    const price = getProductPrice(product.id, size);
    if (price) setPrice(price);
  };

  const handleSaveMargin = (marginValue: number) => {
    setMargin(marginValue);
  };

  const calculatePriceWithMargin = () => {
    if (price !== null && margin !== null) {
      return price + (price * margin) / 100;
    }
    return null;
  };

  const updateVariantDiscontinuedStatus = async (
    variantId: number,
    status: boolean,
  ) => {
    // optimistic update in the variantGroups state

    setVariantGroups((groups: DistinctVariantGroup[]) => {
      const updatedGroups = groups.map((group) => {
        const updatedVariants = group.variants.map((variant) => {
          if (variant.id === variantId) {
            return { ...variant, discontinued: status };
          }
          return variant;
        });
        return { ...group, variants: updatedVariants };
      });
      return updatedGroups;
    });

    const { result, error } = await database.updateVariantStatus(
      variantId,
      status,
    );

    if (error) {
      console.error("Error updating variant status:", error);
      return;
    }
    console.log("Variant status updated:", result);
  };

  return (
    <div className="border rounded-md p-4 shadow-md border-[#ced2d7] mb-10">
      <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded-md">
        {product.type_name}
      </span>
      <div className="flex min-h-[30vh] items-center justify-center mb-4">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-40 object-cover rounded-md mb-4"
        />
      </div>
      <h2 className="text-lg font-semibold mb-2">{product.title}</h2>

      <div className="space-y-8">
        {/* Variant Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {getVariantsOfGroup(product.id, selectedSize).map((variant) => (
            <div
              key={variant.variant_id}
              className={`relative h-10 w-10 flex items-center justify-center rounded-md border cursor-pointer shadow-sm
          ${
            variant.variant_id === selectedVariantId
              ? `border-blue-500 border-2 ${isVariantDiscontinued(variant.variant_id) ? "bg-red-50" : "bg-green-50"}`
              : isVariantDiscontinued(variant.variant_id)
                ? "border-red-500 bg-red-50"
                : "border-green-500 bg-green-50"
          } hover:shadow-md transition`}
              onClick={() => setSelectedVariantId(variant.variant_id)}
            >
              {/* Color Circle */}
              <div
                className={`w-6 h-6 rounded-full mx-auto border ${
                  variant.variant_id === selectedVariantId
                    ? "border-blue-500"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: variant.color }}
              ></div>
              {isVariantDiscontinued(variant.variant_id) && (
                <div className="absolute top-0 left-0 h-[50px] bg-red-500 w-[2px] rotate-45 translate-x-[20px] -translate-y-[5px]">
                  {" "}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Variant Actions */}
        {selectedVariantId && (
          <div className="p-4 rounded-lg bg-gray-100 border shadow">
            <h3 className="text-lg font-medium text-gray-800">
              Selected Variant: {selectedVariantId}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Color:{" "}
              {
                getVariantsOfGroup(product.id, selectedSize).find(
                  (v) => v.variant_id === selectedVariantId,
                )?.color
              }
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Status:{" "}
              <span
                className={`font-semibold ${
                  isVariantDiscontinued(selectedVariantId)
                    ? "text-red-500"
                    : "text-green-600"
                }`}
              >
                {isVariantDiscontinued(selectedVariantId)
                  ? "Discontinued"
                  : "Available"}
              </span>
            </p>

            {/* Mark as Discontinued Button */}
            <button
              className="mt-4 px-6 py-2 rounded-md bg-red-500 text-white font-medium transition hover:bg-red-600 shadow"
              onClick={() =>
                updateVariantDiscontinuedStatus(
                  selectedVariantId,
                  !isVariantDiscontinued(selectedVariantId),
                )
              }
            >
              {isVariantDiscontinued(selectedVariantId)
                ? "Mark as Available"
                : "Mark as Discontinued"}
            </button>
          </div>
        )}
      </div>

      <select
        className="block w-full mt-4 p-2 border border-gray-300 rounded-md"
        value={selectedSize}
        onChange={handleSizeChange}
      >
        <option value="">Select Size</option>
        {getProductSizes(product.id)
          .sort((a, b) => {
            if (a === "S") return -1;
            if (b === "S") return 1;
            if (a === "M") return -1;
            if (b === "M") return 1;
            if (a === "L") return -1;
            if (b === "L") return 1;
            if (a === "XL") return -1;
            if (b === "XL") return 1;
            if (a === "2XL") return -1;
            if (b === "2XL") return 1;
            if (a === "3XL") return -1;
            if (b === "3XL") return 1;
            if (a === "4XL") return -1;
            if (b === "4XL") return 1;
            return 0;
          })
          .map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
      </select>

      {selectedSize && (
        <div className="mt-2">
          <div>
            <span className="font-medium">Original Price: </span>$
            {price?.toFixed(2)}
          </div>
          {margin !== null && (
            <div>
              <span className="font-medium">Margin: </span>
              {margin}%
            </div>
          )}
          {margin !== null && (
            <div>
              <span className="font-medium">Price with Margin: </span>$
              {calculatePriceWithMargin()?.toFixed(2)}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-4 bg-[#3b4a5e] text-white px-6 w-full py-3 rounded-md float-right hover:bg-[#2d3b47] transition duration-300"
      >
        Set Margin
      </button>

      {isModalOpen && (
        <Modal
          setIsModalOpen={setIsModalOpen}
          onSave={handleSaveMargin}
          productId={product.id}
        />
      )}
    </div>
  );
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

function ProductList({
  products,
  variantGroups,
  setVariantGroups,
}: {
  products: Product[];
  variantGroups: DistinctVariantGroup[];
  setVariantGroups: (groups: DistinctVariantGroup[]) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {getSortedProducts(products)?.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variantGroups={variantGroups}
          setVariantGroups={setVariantGroups}
        />
      ))}
    </div>
  );
}

// Navbar Component
// function Navbar({ isAdmin, user }: { isAdmin: boolean; user: any }) {
//   const [isProfileOpen, setIsProfileOpen] = useState(false);

//   const handleProfileClick = () => {
//     setIsProfileOpen((prev) => !prev);
//   };

//   return (
//     <div className="flex items-center justify-between p-4 bg-[#25384c] text-white sticky top-0 z-10">
//       <h1 className="text-2xl font-bold">Admin Dashboard</h1>
//       <div className="relative">
//         {isAdmin && user ? (
//           <div>
//             <img
//               src={user.imageUrl}
//               alt="Profile"
//               className="w-10 h-10  rounded-full cursor-pointer"
//               onClick={handleProfileClick}
//             />
//             {isProfileOpen && (
//               <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-30">
//                 <ul className="text-dark font-medium text-center">
//                   <li className="px-4 pt-2">
//                     <p className="text-dark font-bold">{user.fullName}</p>
//                   </li>
//                   {user.emailAddresses && user.emailAddresses[0] && (
//                     <li className="px-4 p-2">
//                       <p className="text-dark font-light break-all">
//                         {user.emailAddresses[0].emailAddress}
//                       </p>
//                     </li>
//                   )}
//                   <li className="border-b border-gray-200"></li>

//                   <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
//                     <SignOutButton>
//                       <button className="w-max text-danger font-bold">
//                         Sign Out
//                       </button>
//                     </SignOutButton>
//                   </li>
//                 </ul>
//               </div>
//             )}
//           </div>
//         ) : (
//           <SignInButton mode="modal">
//             <button className="bg-accent text-light p-2 rounded-md">
//               Sign In
//             </button>
//           </SignInButton>
//         )}
//       </div>
//     </div>
//   );
// }

export default function Admin() {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [variantGroups, setVariantGroups] = useState<DistinctVariantGroup[]>(
    [],
  );
  const [activeTab, setActiveTab] = useState<string>("Products");

  useEffect(() => {
    const checkAdmin = () => {
      const list_of_admin_emails = [
        "mdmarufbinsalim@gmail.com",
        "waliurrahman957@gmail.com",
        "visualstream709@gmail.com",
      ];

      const userEmail = user?.emailAddresses[0].emailAddress;

      setIsAdmin(
        userEmail && list_of_admin_emails.includes(userEmail) ? true : false,
      );
    };
    checkAdmin();
  }, [user]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const fetchVariants = async (id: number): Promise<Variant[]> => {
    const { result, error } = await database.getProductVariants(id);
    if (error || !result) throw new Error(error || "No variants found");

    const variants = result as Variant[];
    const groupedVariants = variants.reduce<DistinctVariantGroup[]>(
      (acc, variant) => {
        const group = acc.find(
          (g) => g.size === variant.size && g.product_id === variant.product_id,
        );
        if (group) {
          group.variants.push(variant);
        } else {
          acc.push({
            variants: [variant],
            size: variant.size,
            product_id: variant.product_id,
          });
        }
        return acc;
      },
      [],
    );

    // Deduplicate and update variantGroups
    setVariantGroups((groups) => {
      const combinedGroups = [...groups, ...groupedVariants];

      const uniqueGroups = combinedGroups.reduce<DistinctVariantGroup[]>(
        (acc, group) => {
          const exists = acc.some(
            (g) => g.product_id === group.product_id && g.size === group.size,
          );
          if (!exists) {
            acc.push(group);
          }
          return acc;
        },
        [],
      );

      return uniqueGroups;
    });

    return [];
  };

  useEffect(() => {
    if (isAdmin) {
      const fetchProducts = async () => {
        const { result, error } = await database.getProducts();

        if (error) {
          setError(error);
          return;
        }

        const products = result as Product[];
        setProducts(products);

        const queries = products.map((product) => fetchVariants(product.id));
        await Promise.all(queries);
      };

      fetchProducts();
    }
  }, [isAdmin]);

  if (!isLoaded) {
    return (
      <div>
        <FullPageSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <SignInButton mode="modal">
        <button className="flex bg-accent p-1 px-2 text-light font-bold rounded-md min-w-[80px] w-max items-center justify-center">
          Sign In
        </button>
      </SignInButton>
    );
  }

  if (user && !isAdmin) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-1/6 bg-[#25384c] text-white flex flex-col">
        <div className="flex justify-center  items-center p-4 mb-2">
          <h1 className="text-2xl font-bold">VisualStream</h1>
        </div>

        {/* Tabs */}
        <div className="flex flex-col">
          <button
            className={`text-white p-2 mb-2 rounded-md ${activeTab === "Products" ? "bg-gray-600" : ""}`}
            onClick={() => handleTabChange("Products")}
          >
            Products
          </button>
          <button
            className={`text-white p-2 mb-2 rounded-md ${activeTab === "Stripe Details" ? "bg-gray-600" : ""}`}
            onClick={() => handleTabChange("Stripe Details")}
          >
            Quick Links
          </button>
          {/* <button
    className={`text-white p-2 mb-2 rounded-md ${activeTab === "Analytics" ? "bg-gray-600" : ""}`}
    onClick={() => handleTabChange("Analytics")}
  >
    Analytics
  </button> */}
        </div>

        {isAdmin && user && (
          <div className="flex flex-col items-center mt-auto p-4">
            <img
              src={user.imageUrl}
              alt="Profile"
              className="w-14 h-14 rounded-full mb-1 cursor-pointer"
            />
            <p className="text-lg font-medium">{user.fullName}</p>
            <p className="text-sm text-gray-300">
              {user.emailAddresses[0]?.emailAddress}
            </p>
            <SignOutButton>
              <button className="bg-red-800 mb-4 text-white mt-4 px-5 py-2 rounded-md">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        )}
      </div>

      {/* Right Content Area */}
      <div className="w-5/6 p-6 flex justify-center  overflow-y-auto">
        {activeTab === "Products" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 ">Products</h2>
            <p className="text-gray-600 mb-4">
              Here are all your products for management and updates.{" "}
            </p>

            {products && (
              <ProductList
                products={products}
                variantGroups={variantGroups}
                setVariantGroups={setVariantGroups}
              />
            )}
          </div>
        )}

        {activeTab === "Stripe Details" && (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800">Quick Links</h2>
            <p className="text-gray-600">
              Quickly access and manage essential resources and actions through
              the links below.
            </p>

            <div className="grid grid-cols-1 mt-5 sm:grid-cols-3 gap-6">
              <div
                onClick={() =>
                  window.open(
                    "https://dashboard.stripe.com/dashboard",
                    "_blank",
                  )
                }
                className="relative p-4 border rounded-lg shadow-md border-gray-400 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              >
                <div className="flex justify-center mb-4">
                  <img src="/dashboard.png" alt="" className="w-20 h-20" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Stripe Dashboard
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Monitor your transactions, payouts, and overall account
                  status.
                </p>
              </div>

              <div
                onClick={() =>
                  window.open(
                    "https://dashboard.stripe.com/test/payments",
                    "_blank",
                  )
                }
                className="relative p-4 border rounded-lg shadow-md border-gray-400 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              >
                <div className="flex justify-center mb-4">
                  <img src="/transaction.png" alt="" className="w-20 h-20" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Transactions
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  View all transactions and balance activities in detail.
                </p>
              </div>

              <div
                onClick={() =>
                  window.open(
                    "https://dashboard.stripe.com/test/customers",
                    "_blank",
                  )
                }
                className="relative p-4 border rounded-lg shadow-md border-gray-400 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              >
                <div className="flex justify-center mb-4">
                  <img src="/customers.png" alt="" className="w-20 h-20" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Customers
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  View all customers and their details.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab
        {activeTab === "Analytics" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Analytics</h2>
            <button
              onClick={() => window.location.href = '/admin/analytics'}
              className="bg-gray-600 text-white px-6 py-3 rounded-md"
            >
              Go to Analytics Page
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
}
