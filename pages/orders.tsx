import Nav from "@/components/nav";
import useCart from "@/components/nav/useCart";
import { FullPageSpinner } from "@/components/spinners/fullPageSpiner";
import { SupabaseWrapper } from "@/database/supabase";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";

interface Category {
  id: number;
  name: string;
  displayName?: string; // or display_name if that's the field name in your DB
  priority?: number;
}

interface Order {
  id: string;
  date: string;
  created_at: string;
  products: {
    name: string;
    size: string;
    qty: number;
    price: string;
    image: string;
  }[];
  status: string;
  total: number;
  tax: number;
  shippingCharge: number;
}

interface DatabaseOrder {
  order_id: number;
  status: string;
  email: string;
  address: {
    city: string;
    line1: string;
    line2: string | null;
    state: string | null;
    country: string;
    postal_code: string;
  };
  user_id: string;
  cart_items: {
    name: string;
    size: string;
    color: string;
    image: string;
    price: number;
    image_id: number;
    quantity: number;
    product_id: number;
    variant_id: number;
  }[];
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
}

let formattedDate = (date: string) => {
  let d = new Date(date);
  return d.toDateString();
};

const Orders = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const database = new SupabaseWrapper("CLIENT");

  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      let supabase = new SupabaseWrapper("CLIENT");
      const { result, error } = await supabase.getAutomateCategories();
      if (result) {
        const sortedCategories = (result as Category[])
          .slice()
          .sort((a, b) => (a.priority || 0) - (b.priority || 0));

        setCategories(sortedCategories);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      let { result, error } = await database.getOrders(user.id);
      console.log(result);
      if (error) return;
      setOrders(result);

      let mappedOrdersData = result.map((order: DatabaseOrder) => {
        return {
          id: order.order_id,
          date: formattedDate(order.created_at),
          created_at: order.created_at,
          products: order.cart_items.map((item: any) => {
            return {
              name: item.name,
              size: item.size,
              qty: item.quantity,
              price: item.price,
              image: item.image,
            };
          }),
          status: order.status,
          total: order.total_amount,
          tax: order.tax_amount,
          shippingCharge: order.shipping_amount,
        };
      });

      setOrders(mappedOrdersData);
    }

    if (user) fetchOrders();
  }, [user]);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push("/");
      }
    }
  }, [isLoaded]);

  const { count } = useCart({
    rerender: false,
    setRerenderNav: () => {},
    user,
  });

  if (!isLoaded) return <FullPageSpinner />;

  return (
    <div className="max-h-dvh h-dvh bg-gray-100 overflow-hidden flex flex-col">
      <Nav user={user} cartCount={count} categories={categories} />
      <main className=" min-w-[80vw] m-auto px-4 py-8 flex-1 overflow-hidden">
        <div className="flex items-center mb-2 text-sm text-gray-800 hover:text-gray-800">
          <Link href="/" className="flex items-center space-x-2">
            <IoArrowBack className="text-lg" />
            <span>Back</span>
          </Link>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-800 mb-6">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="flex items-center justify-center h-[70dvh]">
            <p className="text-lg text-gray-500">You have no orders yet.</p>
          </div>
        ) : (
          <div className="flex flex-col  flex-1 overflow-auto h-[70dvh] no-scrollbar">
            {orders
              .sort((a, b) => {
                return (
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
                );
              })
              .map((order) => {
                const grandTotal =
                  order.total + order.tax + order.shippingCharge;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-lg mb-6 border border-gray-300"
                  >
                    {/* Order Header */}
                    <div className="bg-gray-100 px-6 py-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Order ID:</span>{" "}
                          <span className="text-blue-600 font-bold">
                            {order.id}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Placed on: {order.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === "In-Transit"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="px-6 py-4 space-y-4">
                      {order.products.map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-6 border-b border-gray-200 pb-4 last:border-b-0"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-18 rounded-md object-cover"
                          />
                          <div className="flex-grow">
                            <h2 className="text-lg font-medium text-gray-800">
                              {product.name}
                            </h2>
                            <p className="text-sm text-gray-500">
                              Size: {product.size} | Qty: {product.qty}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-gray-800">
                            ${product.price}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center text-sm text-gray-600">
                      <div>
                        <p>
                          <span className="font-semibold">Tax:</span> $
                          {order.tax}
                        </p>
                        <p>
                          <span className="font-semibold">Shipping:</span> $
                          {order.shippingCharge}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold">
                          Total:{" "}
                          <span className="text-lg text-blue-600">
                            ${order.total}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
