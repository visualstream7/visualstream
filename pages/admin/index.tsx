import { SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Product, SupabaseWrapper } from "@/database/supabase";

export default function admin() {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    function checkAdmin() {
      let list_of_admin_emails = ["mdmarufbinsalim@gmail.com", "waliurrahman957@gmail.com"];

      let userEmail = user?.emailAddresses[0].emailAddress;

      if (userEmail && list_of_admin_emails.includes(userEmail)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [user]);


  useEffect(() => {
    if (isAdmin) {
      const fetchProducts = async () => {
        const supabase = new SupabaseWrapper("CLIENT"); 
        const { result, error } = await supabase.getProducts();

        if (error) {
          setError(error);
        } else {
          setProducts(result);
        }
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
      {error && <div className="text-red-500">Error fetching products: {error}</div>}
      {products ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-md p-4 shadow-sm hover:shadow-lg transition-shadow duration-200"
            >
              <img
                src={product.image}
                alt={product.title}
                className="h-48 w-48 object-cover rounded-md mb-4"
              />
              <h2 className="text-lg font-semibold mb-2">{product.title}</h2>  
              <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded-md">
                {product.type_name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div>Loading products...</div>
      )}
    </div>
  );
}
