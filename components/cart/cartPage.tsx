import React, { useEffect, useState } from "react";
import { SupabaseWrapper } from "@/database/supabase";
import { UserResource } from "@clerk/types";
import {
  incrementCartItem,
  decrementCartItem,
  CartItem,
} from "@/database/functions/users/cart";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import Nav from "../nav";
import Link from "next/link";

interface CartProps {
  user: UserResource | null | undefined;
}

const database = new SupabaseWrapper("CLIENT");

export default function Cart({ user }: CartProps) {
  const [cartItems, setCartItems] = useState<
    {
      product_id: number;
      variant_id: number;
      quantity: number;
      image_id: number;
      size: string;
      mock: string;
      title: string;
      color: string;
      price: number;
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchCartData() {
    setLoading(true);
    try {
      const { result: cartItems, error: cartError } =
        await database.getCartItems(user!.id);

      if (cartError) {
        console.error("Error fetching cart items:", cartError);
        setLoading(false);
        return;
      }

      if (cartItems) {
        const detailedItems = await Promise.all(
          cartItems.map(async (item: CartItem) => {
            try {
              const { result, error } =
                await database.getProductVariantMockAfterJoin(
                  item.product_id,
                  item.variant_id,
                  item.image_id,
                );

              if (error) {
                console.error("Error fetching product variant data:", error);
                return null;
              }

              if (result) {
                return {
                  ...item,
                  title: result.title,
                  mock: result.mock,
                  size: result.size,
                  color: result.color_code,
                  price: result.price,
                };
              }
            } catch (err) {
              console.error("Error during fetch:", err);
              return null;
            }
          }),
        );

        const validItems = detailedItems.filter((item) => item !== null);
        setCartItems(validItems as typeof cartItems);
      }
    } catch (err) {
      console.error("Unexpected error fetching cart data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      fetchCartData();
    }
  }, [user]);

  const handleIncrement = async (
    productId: number,
    variantId: number,
    image_id: number,
  ) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product_id === productId && item.variant_id === variantId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );

    try {
      const { error } = await incrementCartItem(
        user!.id,
        productId,
        variantId,
        image_id,
        database.client,
      );
      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      console.error("Error incrementing item:", error);
      await fetchCartData();
    }
  };

  const handleDecrement = async (productId: number, variantId: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product_id === productId && item.variant_id === variantId
          ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
          : item,
      ),
    );

    try {
      const { error } = await decrementCartItem(
        user!.id,
        productId,
        variantId,
        database.client,
      );

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      console.error("Error decrementing item:", error);
      await fetchCartData();
    }
  };

  async function removeItemFromCart(productId: number, variantId: number) {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(item.product_id === productId && item.variant_id === variantId),
      ),
    );

    try {
      const { error } = await database.removeCartItem(
        user!.id,
        productId,
        variantId,
      );

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      console.error("Error removing item:", error);
      await fetchCartData();
    }
  }

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shipping = 5.99;
  const tax = subtotal * 0.08;

  return (
    <div className="flex flex-col bg-white h-dvh lg:overflow-y-hidden">
      <Nav user={user} />
      <div className="flex-1 flex flex-col lg:flex-row p-6">
        <div className="lg:pr-4 flex flex-col flex-1 h-[80vh]">
          <div className="h-full pr-2 flex-1 flex flex-col">
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : cartItems.length === 0 ? (
              <p className="text-gray-600">Your cart is empty.</p>
            ) : (
              <ul className="space-y-4 overflow-auto flex-1 h-[90%] overflow-y-scroll p-4 custom-scrollbar">
                {cartItems.map((item) => (
                  <li
                    key={`${item.product_id}-${item.variant_id}`}
                    className="flex items-center justify-between shadow-lg p-4 rounded-xl border-b hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      {item.mock && (
                        <img
                          src={item.mock}
                          alt={item.title}
                          className="w-30 h-24 object-cover rounded-md shadow-md"
                        />
                      )}
                      <div className="w-3/4">
                        <Link
                          href={`/product/${item.image_id}/${item.product_id}`}
                        >
                          <h3 className="text-lg font-semibold text-gray-800 cursor-pointer hover:underline">
                            {item.title}
                          </h3>
                        </Link>
                        {/* <p className="text-sm text-gray-500">
                          Product Id: {item.product_id}
                        </p>
                        <p className="text-sm text-gray-500">
                          Variant Id: {item.variant_id}
                        </p> */}
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500">Color:</p>
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          Size: {item.size}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-700">
                            ${item.price}
                          </span>
                          <button
                            onClick={() =>
                              handleDecrement(item.product_id, item.variant_id)
                            }
                            className="h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold"
                          >
                            <MinusIcon size={16} />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleIncrement(
                                item.product_id,
                                item.variant_id,
                                item.image_id,
                              )
                            }
                            className="h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold"
                          >
                            <PlusIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <TrashIcon
                      onClick={() =>
                        removeItemFromCart(item.product_id, item.variant_id)
                      }
                      className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/4 pl-4 sticky top-6">
          <div className="bg-white p-6 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Price Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="text-gray-700">${subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${(subtotal + shipping + tax).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              className="w-full mt-6 py-2 bg-yellow-600 text-white font-bold rounded-md hover:bg-yellow-700"
              onClick={() => alert("Proceed to checkout")}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
