import { SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Product, SupabaseWrapper, Variant } from "@/database/supabase";

const database = new SupabaseWrapper("CLIENT");

interface DistinctVariantGroup {
  product_id: number;
  size: string;
  variants: Variant[];
}

function ProductCard({ product, variantGroups }) {
  const [selectedSize, setSelectedSize] = useState("");
  const [price, setPrice] = useState<number | null>(null);

  const getProductSizes = (product_id: number) => {
    if (!variantGroups) return [];
    return variantGroups
      .filter((group) => group.product_id === product_id)
      .map((group) => ({
        size: group.size,
        product_id: group.product_id,
      }));
  };

  const getProductPrice = (product_id: number, size: string) => {
    if (!variantGroups) return null;
    const price = variantGroups
      .filter((group) => group.product_id === product_id && group.size === size)
      .map((group) => group.variants[0].price);
    return price[0] || null;
  };

  const handleSizeChange = (e) => {
    const size = e.target.value;
    setSelectedSize(size);
    const price = getProductPrice(product.id, size);
    setPrice(price);
  };

  return (
    <div className="border rounded-md p-4 shadow-sm hover:shadow-lg transition-shadow duration-200">
      <img
        src={product.image}
        alt={product.title}
        className="h-48 w-48 object-cover rounded-md mb-4"
      />
      <h2 className="text-lg font-semibold mb-2">{product.title}</h2>
      <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded-md">
        {product.type_name}
      </span>

      <select
        className="block w-full mt-4 p-2 border border-gray-300 rounded-md"
        name="size"
        id="size"
        value={selectedSize}
        onChange={handleSizeChange}
      >
        <option value="">Select Size</option>
        {getProductSizes(product.id).map((item) => (
          <option key={item.size} value={item.size}>
            {item.size}
          </option>
        ))}
      </select>

      {selectedSize && (
        <div className="mt-2">
          <span className="font-medium">Price: </span>${price}
        </div>
      )}
    </div>
  );
}

function ProductList({ products, variantGroups }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variantGroups={variantGroups}
        />
      ))}
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

  useEffect(() => {
    const checkAdmin = () => {
      const list_of_admin_emails = [
        "mdmarufbinsalim@gmail.com",
        "waliurrahman957@gmail.com",
      ];

      const userEmail = user?.emailAddresses[0].emailAddress;

      setIsAdmin(userEmail && list_of_admin_emails.includes(userEmail));
    };
    checkAdmin();
  }, [user]);

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

    setVariantGroups((groups) => [...groups, ...groupedVariants]);
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
    return <div>Loading...</div>;
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {error && (
        <div className="text-red-500">Error fetching products: {error}</div>
      )}
      {products ? (
        <ProductList products={products} variantGroups={variantGroups} />
      ) : (
        <div>Loading products...</div>
      )}
    </div>
  );
}
