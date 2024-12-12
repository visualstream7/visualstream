import React, { useEffect, useState } from "react";
import { SupabaseWrapper } from "@/database/supabase";
import { UserResource } from "@clerk/types";
import {
  incrementCartItem,
  decrementCartItem,
  CartItem,
} from "@/database/functions/users/cart";
import { TrashIcon } from "lucide-react";

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
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchCartData() {
    setLoading(true);
    try {
      // Fetch basic cart items
      const { result: cartItems, error: cartError } =
        await database.getCartItems(user!.id);

      if (cartError) {
        console.error("Error fetching cart items:", cartError);
        setLoading(false);
        return;
      }

      if (cartItems) {
        // Fetch additional details for each cart item
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
                  ...item, // Basic cart item properties
                  title: result.title,
                  mock: result.mock,
                  size: result.size,
                  color: result.color_code,
                };
              }
            } catch (err) {
              console.error("Error during fetch:", err);
              return null;
            }
          }),
        );

        // Filter out null values from failed fetches
        const validItems = detailedItems.filter((item) => item !== null);
        setCartItems(validItems as typeof cartItems); // Update cart state
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

  // Optimistic Increment
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
      await fetchCartData(); // Revert optimistic update on error
    }
  };

  // Optimistic Decrement
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
      await fetchCartData(); // Revert optimistic update on error
    }
  };

  async function removeItemFromCart(productId: number, variantId: number) {
    // Optimistically update the quantity in the cart
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(item.product_id === productId && item.variant_id === variantId),
      ),
    );

    try {
      // Sync with database to ensure data consistency
      const { error } = await database.removeCartItem(
        user!.id,
        productId,
        variantId,
      );

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      console.error("Error decrementing item:", error);
      // Optionally revert the optimistic update on error
      await fetchCartData();
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {loading ? (
        <p>Loading...</p>
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul className="space-y-4">
          {JSON.stringify(cartItems)}
          {cartItems?.map((item) => (
            <li
              key={`${item.product_id}-${item.variant_id}`}
              className="flex items-center justify-between border p-4 rounded-md"
            >
              <div>
                <p>Product ID: {item.product_id}</p>
                <p>Variant ID: {item.variant_id}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    handleDecrement(item.product_id, item.variant_id)
                  }
                  className="h-8 w-8 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() =>
                    handleIncrement(
                      item.product_id,
                      item.variant_id,
                      item.image_id,
                    )
                  }
                  className="h-8 w-8 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  +
                </button>

                <TrashIcon
                  onClick={() =>
                    removeItemFromCart(item.product_id, item.variant_id)
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
