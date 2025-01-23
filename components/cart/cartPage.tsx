import React, { useState } from "react";
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
import useCart from "../nav/useCart";

// Import the Shipping component
import Shipping from "../Shipping"; // Adjust the path as necessary
import { loadStripe } from "@stripe/stripe-js";
import { BiArrowBack, BiCart } from "react-icons/bi";
import { PiEmpty } from "react-icons/pi";
import { GiEmptyMetalBucket } from "react-icons/gi";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface CartProps {
  user: UserResource | null | undefined;
}

const database = new SupabaseWrapper("CLIENT");

export default function Cart({ user }: CartProps) {
  const [rerenderNav, setRerenderNav] = useState<boolean>(false);
  const [showShipping, setShowShipping] = useState<boolean>(false); // State to control the shipping form visibility
  const {
    cartItems,
    count,
    shipping,
    tax,
    loading,
    handleIncrement,
    handleDecrement,
    removeItemFromCart,
  } = useCart({ rerender: rerenderNav, setRerenderNav: setRerenderNav, user });

  async function handleCheckout() {
    setShowShipping(true); // Show the shipping form when "Proceed to Checkout" is clicked
  }

  const subtotal = cartItems.reduce(
    (acc, item) => acc + parseFloat(getPrice(item)) * item.quantity,
    0,
  );

  function getPrice(item: (typeof cartItems)[0]) {
    let price = 0;
    let margin = item.margin || 0;
    margin = margin / 100;

    if (item.price) {
      let numPrice = Number(item.price);
      price = numPrice + numPrice * margin;
    }

    return price.toFixed(2);
  }

  return (
    <div className="flex flex-col bg-white h-dvh lg:overflow-y-hidden">
      <Nav user={user} cartCount={cartItems.length} />
      <div className="flex-1 flex flex-col lg:flex-row p-6">
        <div
          className={`lg:pr-4 flex flex-col flex-1 overflow-hidden ${
            showShipping
              ? "max-h-[40vh] md:max-h-[80vh]"
              : "max-h-[60vh] md:max-h-[80vh]"
          }`}
        >
          {" "}
          <div className="h-full pr-2 flex-1 flex flex-col">
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <BiCart className="w-14 h-14 mb-8 text-gray-400" />
                <p className="text-gray-400 text-lg">Your cart is empty</p>
              </div>
            ) : (
              <ul className="space-y-4 overflow-auto flex-1 h-[90%] overflow-y-scroll p-4 custom-scrollbar">
                {cartItems.map((item) => (
                  <li
                    key={`${item.product_id}-${item.variant_id}-${item.image_id}`}
                    className="flex items-center justify-between shadow-lg p-4 rounded-xl border-b hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      {item.mock &&
                        item.product_id !== 534 && // 534 is the product_id for the puzzle
                        item.product_id !== 358 && ( // 358 is the product_id for the sticker
                          <img
                            src={item.mock}
                            alt={item.title}
                            className="w-30 h-24 object-cover rounded-md shadow-md"
                          />
                        )}

                      {item.product_id === 534 && (
                        <img
                          src={"/puzzle.png"}
                          alt="Product"
                          className={`w-[120px]`}
                          style={{
                            background: `url('${item?.image || ""}') center/120px 120px no-repeat`,
                          }}
                        />
                      )}

                      {item.product_id === 358 && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-[120px] object-cover rounded-md shadow-md border border-[#00000010] p-2"
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
                        {item.color && (
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-500">Color:</p>
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                          </div>
                        )}
                        <p className="text-sm text-gray-500">
                          Size: {item.size}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-700">
                            ${getPrice(item)}
                          </span>
                          <button
                            onClick={() =>
                              handleDecrement(
                                item.product_id,
                                item.variant_id,
                                item.image_id,
                                item.quantity,
                              )
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
                        removeItemFromCart(
                          item.product_id,
                          item.variant_id,
                          item.image_id,
                        )
                      }
                      className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {cartItems && cartItems.length > 0 && (
          <div className="w-full lg:w-1/4 top-6 mt-auto mb-[60px] md:mt-0">
            <div className="bg-white p-6 shadow-md rounded-lg">
              {!showShipping ? (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Price Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total *</span>
                      <span className="text-gray-700">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">
                        * Shipping and taxes not included
                      </span>
                    </div>
                  </div>

                  <button
                    className="w-full mt-6 py-2 bg-yellow-600 text-white font-bold rounded-md hover:bg-yellow-700"
                    onClick={() => handleCheckout()}
                  >
                    Proceed to Checkout
                  </button>
                </>
              ) : (
                <Shipping
                  rerenderNav={rerenderNav}
                  setRerenderNav={setRerenderNav}
                  setShowShipping={setShowShipping}
                /> // Render the Shipping component when showShipping is true
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
