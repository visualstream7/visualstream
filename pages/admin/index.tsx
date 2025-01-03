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

function ShippingVATModal({
  setIsModalOpen,
  onSave,
  shippingCost,
  vatPercentage,
}: {
  setIsModalOpen: (value: boolean) => void;
  onSave: (shippingCost: number, vatPercentage: number) => void;
  shippingCost: number;
  vatPercentage: number;
}) {
  const [newShippingCost, setNewShippingCost] = useState(shippingCost);
  const [newVatPercentage, setNewVatPercentage] = useState(vatPercentage);

  const handleSave = async () => {
    if (!isNaN(newShippingCost) && !isNaN(newVatPercentage)) {
      try {
        const { error } = await database.updateProductCharges(
          newShippingCost,
          newVatPercentage,
        );
        if (error) {
          console.error("Error updating charges:", error);
          return;
        }
        onSave(newShippingCost, newVatPercentage);
        setIsModalOpen(false);
      } catch (err) {
        console.error("Unexpected error:", err);
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
        <h2 className="text-lg font-bold mb-4">Set Shipping Charges & VAT</h2>
        <div className="mb-6">
          <label
            htmlFor="shippingCost"
            className="block text-sm font-medium mb-2"
          >
            Shipping Cost
          </label>
          <input
            id="shippingCost"
            type="number"
            value={newShippingCost}
            onChange={(e) => setNewShippingCost(parseFloat(e.target.value))}
            className="border p-2 rounded-md w-full"
            placeholder="Enter shipping cost"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="vatPercentage"
            className="block text-sm font-medium mb-2"
          >
            VAT Percentage
          </label>
          <input
            id="vatPercentage"
            type="number"
            value={newVatPercentage}
            onChange={(e) => setNewVatPercentage(parseFloat(e.target.value))}
            className="border p-2 rounded-md w-full"
            placeholder="Enter VAT percentage"
          />
        </div>

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
}: {
  product: Product;
  variantGroups: DistinctVariantGroup[];
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
    return variantGroups
      .filter((group) => group.product_id === product.id)
      .map((group) => group.variants)
      .flat()
      .find((variant) => variant.id === variant_id)?.discontinued;
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

  return (
    <div className="border rounded-md p-4 shadow-md  border-[#ced2d7] mb-10">
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

      <div className="flex items-center space-x-2 mb-4">
        {getVariantsOfGroup(product.id, selectedSize).map((variant) => (
          <div
            className={`flex items-center space-x-2 ${variant.variant_id === selectedVariantId ? "border border-blue-600 p-4" : ""}`}
            onClick={() => setSelectedVariantId(variant.variant_id)}
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: variant.color }}
            />
            {/* <span>{variant.variant_id}</span> */}
            {/* <span>{variant.discontinued ? "Discontinued" : ""}</span> */}
          </div>
        ))}
      </div>

      <p>
        is variant discontinued:{" "}
        {selectedVariantId &&
          isVariantDiscontinued(selectedVariantId)?.toString()}
      </p>

      <select
        className="block w-full mt-4 p-2 border border-gray-300 rounded-md"
        value={selectedSize}
        onChange={handleSizeChange}
      >
        <option value="">Select Size</option>
        {getProductSizes(product.id).map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      {selectedSize && (
        <div className="mt-2">
          <div>
            <span className="font-medium">Original Price: </span>${price}
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
}: {
  products: Product[];
  variantGroups: DistinctVariantGroup[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {getSortedProducts(products)?.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variantGroups={variantGroups}
        />
      ))}
    </div>
  );
}

// Navbar Component
function Navbar({ isAdmin, user }: { isAdmin: boolean; user: any }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileOpen((prev) => !prev);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-[#25384c] text-white sticky top-0 z-10">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="relative">
        {isAdmin && user ? (
          <div>
            <img
              src={user.imageUrl}
              alt="Profile"
              className="w-10 h-10  rounded-full cursor-pointer"
              onClick={handleProfileClick}
            />
            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-30">
                <ul className="text-dark font-medium text-center">
                  <li className="px-4 pt-2">
                    <p className="text-dark font-bold">{user.fullName}</p>
                  </li>
                  {user.emailAddresses && user.emailAddresses[0] && (
                    <li className="px-4 p-2">
                      <p className="text-dark font-light break-all">
                        {user.emailAddresses[0].emailAddress}
                      </p>
                    </li>
                  )}
                  <li className="border-b border-gray-200"></li>

                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <SignOutButton>
                      <button className="w-max text-danger font-bold">
                        Sign Out
                      </button>
                    </SignOutButton>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <SignInButton mode="modal">
            <button className="bg-accent text-light p-2 rounded-md">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [variantGroups, setVariantGroups] = useState<DistinctVariantGroup[]>(
    [],
  );
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [vatPercentage, setVatPercentage] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      const list_of_admin_emails = [
        "mdmarufbinsalim@gmail.com",
        "waliurrahman957@gmail.com",
      ];

      const userEmail = user?.emailAddresses[0].emailAddress;

      setIsAdmin(
        userEmail && list_of_admin_emails.includes(userEmail) ? true : false,
      );
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    const fetchCharges = async () => {
      const { result, error } = await database.getProductCharges();
      if (error) {
        console.error("Error fetching product charges:", error);
        return;
      }
      if (result) {
        setShippingCost(result.shipping_cost);
        setVatPercentage(result.vat_percentage);
      }
    };
    fetchCharges();
  }, []);

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
    <>
      <Navbar isAdmin={isAdmin} user={user} />
      <div className="container mx-auto p-4 pt-16 overflow-auto">
        {error && (
          <div className="text-red-500">Error fetching products: {error}</div>
        )}
        <div>
          {isAdmin && (
            <>
              <div className="bg-white p-4 rounded-md shadow-md border border-[#ced2d7] mb-8">
                <h3 className="text-xl font-semibold">
                  Shipping Charges & VAT
                </h3>
                {shippingCost !== null && vatPercentage !== null ? (
                  <div className="mt-4">
                    <div>
                      <span className="font-medium">Shipping Cost: </span>$
                      {shippingCost}
                    </div>
                    <div>
                      <span className="font-medium">VAT Percentage: </span>
                      {vatPercentage}%
                    </div>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4 bg-[#3b4a5e] text-white px-6 py-3 rounded-md"
                    >
                      Edit Charges & VAT
                    </button>
                  </div>
                ) : (
                  <div>Loading charges...</div>
                )}
              </div>
            </>
          )}

          {isModalOpen && shippingCost !== null && vatPercentage !== null && (
            <ShippingVATModal
              setIsModalOpen={setIsModalOpen}
              onSave={(newShippingCost, newVatPercentage) => {
                setShippingCost(newShippingCost);
                setVatPercentage(newVatPercentage);
              }}
              shippingCost={shippingCost}
              vatPercentage={vatPercentage}
            />
          )}

          <div>
            {products ? (
              <ProductList products={products} variantGroups={variantGroups} />
            ) : (
              <div className="flex justify-center items-center">
                Loading products...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
