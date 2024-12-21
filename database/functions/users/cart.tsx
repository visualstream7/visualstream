import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/database/types";

export interface CartItem {
  product_id: number;
  variant_id: number;
  image_id: number;
  quantity: number;
}

async function addItemToCart(
  user_id: string,
  product_id: number,
  variant_id: number,
  image_id: number,
  quantity: number,
  client: SupabaseClient,
): Promise<{
  result: CartItem[] | null;
  error: string | null;
}> {
  try {
    let { data: cartData, error: getCartError } = await client
      .from("Users")
      .select("*")
      .eq("id", user_id);

    if (getCartError) {
      console.error("Error fetching cart data", getCartError);
      throw new Error(getCartError.message);
    }

    // Extract the existing cart data or initialize with an empty array
    let previousCart = cartData
      ? (cartData[0].cart as { items: CartItem[] })
      : { items: [] };

    // Check if the product/variant combination already exists
    const existingItemIndex = previousCart.items.findIndex(
      (item) =>
        item.product_id === product_id && item.variant_id === variant_id,
    );

    if (existingItemIndex !== -1) {
      // If found, update the quantity of the existing item
      previousCart.items[existingItemIndex].quantity += quantity;
    } else {
      // If not found, add the new item to the list
      previousCart.items.push({
        product_id,
        variant_id,
        image_id,
        quantity,
      });
    }

    // Update the database with the modified cart
    let { data: newCart, error } = await client
      .from("Users")
      .update({
        cart: {
          items: previousCart.items,
        },
      })
      .eq("id", user_id)
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return {
      result: newCart ? (newCart[0].cart.items as CartItem[]) : [],
      error: null,
    };
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    return {
      result: null,
      error: message,
    };
  }
}

async function removeItemFromCart(
  user_id: string,
  product_id: number,
  variant_id: number,
  client: SupabaseClient,
): Promise<{
  result: CartItem[] | null;
  error: string | null;
}> {
  try {
    let { data: cartData, error: getCartError } = await client
      .from("Users")
      .select("*")
      .eq("id", user_id);

    if (getCartError) {
      console.error("Error fetching cart data", getCartError);
      throw new Error(getCartError.message);
    }

    // Extract the existing cart data or initialize with an empty array
    let previousCart = cartData
      ? (cartData[0].cart as { items: CartItem[] })
      : { items: [] };

    // Check if the product/variant combination already exists
    const existingItemIndex = previousCart.items.findIndex(
      (item) =>
        item.product_id === product_id && item.variant_id === variant_id,
    );

    if (existingItemIndex !== -1) {
      // If found, remove the item from the list
      previousCart.items.splice(existingItemIndex, 1);
    }

    // Update the database with the modified cart
    let { data: newCart, error } = await client
      .from("Users")
      .update({
        cart: {
          items: previousCart.items,
        },
      })
      .eq("id", user_id)
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return {
      result: newCart ? (newCart[0].cart.items as CartItem[]) : [],
      error: null,
    };
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    return {
      result: null,
      error: message,
    };
  }
}

async function incrementCartItem(
  user_id: string,
  product_id: number,
  variant_id: number,
  image_id: number,
  client: SupabaseClient,
): Promise<{
  result: CartItem[] | null;
  error: string | null;
}> {
  return addItemToCart(user_id, product_id, variant_id, image_id, 1, client);
}

async function decrementCartItem(
  user_id: string,
  product_id: number,
  variant_id: number,
  client: SupabaseClient,
): Promise<{
  result: CartItem[] | null;
  error: string | null;
}> {
  try {
    let { data: cartData, error: getCartError } = await client
      .from("Users")
      .select("*")
      .eq("id", user_id);

    if (getCartError) {
      console.error("Error fetching cart data", getCartError);
      throw new Error(getCartError.message);
    }

    // Extract the existing cart data or initialize with an empty array
    let previousCart = cartData
      ? (cartData[0].cart as { items: CartItem[] })
      : { items: [] };

    // Check if the product/variant combination already exists
    const existingItemIndex = previousCart.items.findIndex(
      (item) =>
        item.product_id === product_id && item.variant_id === variant_id,
    );

    if (existingItemIndex !== -1) {
      // If found, decrement the quantity of the existing item
      if (previousCart.items[existingItemIndex].quantity > 1) {
        previousCart.items[existingItemIndex].quantity -= 1;
      } else {
        // If quantity is 1, remove the item from the list
        previousCart.items.splice(existingItemIndex, 1);
      }
    }

    // Update the database with the modified cart
    let { data: newCart, error } = await client
      .from("Users")
      .update({
        cart: {
          items: previousCart.items,
        },
      })
      .eq("id", user_id)
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return {
      result: newCart ? (newCart[0].cart.items as CartItem[]) : [],
      error: null,
    };
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    return {
      result: null,
      error: message,
    };
  }
}

export {
  addItemToCart,
  removeItemFromCart,
  incrementCartItem,
  decrementCartItem,
};
