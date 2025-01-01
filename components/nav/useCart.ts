import { CartItem } from "@/database/functions/users/cart";
import { SupabaseWrapper } from "@/database/supabase";
import { UserResource } from "@clerk/types";
import { useEffect, useState } from "react";
import {
  incrementCartItem,
  decrementCartItem,
} from "@/database/functions/users/cart";
export default function useCart({
  rerender,
  user,
}: {
  rerender: boolean | undefined;
  setRerenderNav: React.Dispatch<React.SetStateAction<boolean>>;
  user: UserResource | null | undefined;
}) {
  const [cartCount, setCartCount] = useState(0);

  let [shipping, setShipping] = useState<number>(0);
  let [tax, setTax] = useState<number>(0);
  const [cartItems, setCartItems] = useState<
    {
      product_id: number;
      variant_id: number;
      margin: number;
      quantity: number;
      image_id: number;
      size: string;
      mock: string;
      title: string;
      color: string;
      price: number;
      image: string;
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const database = new SupabaseWrapper("CLIENT");

  async function fetchCartData(cartData: CartItem[]) {
    setLoading(true);
    try {
      let cartItems = cartData;

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
                  image: result.image_url,
                  margin: result.margin,
                };
              }
            } catch (err) {
              console.error("Error during fetch:", err);
              return null;
            }
          }),
        );

        const validItems = detailedItems.filter((item) => item !== null);
        // @ts-ignore
        setCartItems(validItems);
      }
    } catch (err) {
      console.error("Unexpected error fetching cart data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleIncrement = async (
    productId: number,
    variantId: number,
    image_id: number,
  ) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product_id === productId &&
        item.variant_id === variantId &&
        item.image_id === image_id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );

    if (!user) {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      let updatedCart = cart.map((item: CartItem) => {
        if (
          item.product_id === productId &&
          item.variant_id === variantId &&
          item.image_id === image_id
        ) {
          item.quantity += 1;
        }
        return item;
      });
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return;
    }

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
    }
  };

  const handleDecrement = async (
    productId: number,
    variantId: number,
    image_id: number,
    quantity: number,
  ) => {
    setCartItems(
      (prevItems) =>
        prevItems
          .map((item) =>
            item.product_id === productId &&
            item.variant_id === variantId &&
            item.image_id === image_id
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          )
          .filter((item) => item.quantity > 0), // Remove items with quantity <= 0
    );

    if (!user) {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      let updatedCart = cart.map((item: CartItem) => {
        if (item.product_id === productId && item.variant_id === variantId) {
          item.quantity -= 1;
        }
        return item;
      });
      updatedCart = updatedCart.filter((item: CartItem) => item.quantity > 0);
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      if (quantity === 1) {
        await removeItemFromCart(productId, variantId, image_id);
      }
      return;
    }

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
    }
  };

  async function removeItemFromCart(
    productId: number,
    variantId: number,
    image_id: number,
  ) {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.product_id === productId &&
            item.variant_id === variantId &&
            item.image_id === image_id
          ),
      ),
    );

    if (!user) {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      let updatedCart = cart.filter(
        (item: CartItem) =>
          !(item.product_id === productId && item.variant_id === variantId),
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return;
    }

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
    }
  }

  useEffect(() => {
    async function fetchCharges() {
      const { result, error } = await database.getProductCharges();

      if (error) {
        console.error("Error fetching charges:", error);
        return;
      }

      console.log("Charges:", result);
      setShipping(result?.shipping_cost || 0);
      setTax(result?.vat_percentage || 0);
    }

    fetchCharges();
  }, []);

  useEffect(() => {
    const syncCartData = async (user_id: string) => {
      const { result: databaseCartItems, error: cartError } =
        await database.getCartItems(user!.id);

      if (cartError || !databaseCartItems) {
        return;
      }

      setCartCount(databaseCartItems.length);
      console.log("Database Cart Items:", databaseCartItems);

      const guestCart = localStorage.getItem("cart") || "[]";
      const guestCartItems = JSON.parse(guestCart);
      console.log("Guest Cart Items:", guestCartItems);

      let mergedCartItems = [...databaseCartItems];

      for (const item of guestCartItems) {
        const existingItem = mergedCartItems.find(
          (dbItem) =>
            dbItem.variant_id === item.variant_id &&
            dbItem.product_id === item.product_id &&
            dbItem.image_id === item.image_id,
        );

        if (existingItem) {
          // If the item exists, sum the quantities
          existingItem.quantity += item.quantity;
          // update the cart in the database
        } else {
          // If the item is unique, add it to the merged cart
          mergedCartItems.push(item);
        }
      }

      // Print out the merged cart items
      console.log("Merged Cart Items:", mergedCartItems);
      // update the cart in local storage with the merged cart
      localStorage.setItem("cart", JSON.stringify([]));
      // update the cart in the database
      const { error, result } = await database.updateCartItems(
        user_id,
        mergedCartItems,
      );
      console.log("Updated Cart Items:", result, error);
      fetchCartData(mergedCartItems);
    };

    if (user) {
      syncCartData(user.id);
    } else {
      const cartItems = localStorage.getItem("cart");
      if (cartItems) {
        setCartCount(JSON.parse(cartItems).length);
        fetchCartData(JSON.parse(cartItems));
      }
    }
  }, [rerender, user]);

  return {
    count: cartCount,
    cartItems: cartItems,
    handleIncrement,
    handleDecrement,
    removeItemFromCart,
    loading,
    shipping,
    tax,
  };
}
