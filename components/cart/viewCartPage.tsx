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
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        async function fetchCartData() {
            setLoading(true);
            const { result: items, error } = await database.getCartItems(user!.id);
            if (items) {
                setCartItems(items);
            }
            setLoading(false);
        }

        if (user) {
            fetchCartData();
        }
    }, [user]);

    // Optimistic Increment
    const handleIncrement = async (productId: number, variantId: number) => {
        // Optimistically update the quantity in the cart
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.product_id === productId && item.variant_id === variantId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );

        try {
            await incrementCartItem(user!.id, productId, variantId, database.client);
            // Sync with database to ensure data consistency
            const { result: items, error } = await database.getCartItems(user!.id);
            if (items) {
                setCartItems(items);
            }
        } catch (error) {
            console.error("Error incrementing item:", error);
            // Optionally revert the optimistic update on error
            await fetchCartData();
        }
    };

    // Optimistic Decrement
    const handleDecrement = async (productId: number, variantId: number) => {
        // Optimistically update the quantity in the cart
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.product_id === productId && item.variant_id === variantId
                    ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
                    : item
            )
        );

        try {
            await decrementCartItem(user!.id, productId, variantId, database.client);
            // Sync with database to ensure data consistency
            const { result: items, error } = await database.getCartItems(user!.id);
            if (items) {
                setCartItems(items);
            }
        } catch (error) {
            console.error("Error decrementing item:", error);
            // Optionally revert the optimistic update on error
            await fetchCartData();
        }
    };

    async function removeItemFromCart(productId: number, variantId: number) {

        // Optimistically update the quantity in the cart
        setCartItems((prevItems) =>
            prevItems.filter((item) => !(item.product_id === productId && item.variant_id === variantId))
        );

        try {

            // Sync with database to ensure data consistency
            const { result: items, error } = await database.removeCartItem(user!.id, productId, variantId);
            console.log(items, 'items after remove');
            if (items) {
                setCartItems(items);
            }
        } catch (error) {
            console.error("Error decrementing item:", error);
            // Optionally revert the optimistic update on error
            await fetchCartData();
        }
    }

    // Fetch cart data function for error handling fallback
    async function fetchCartData() {
        setLoading(true);
        const { result: items, error } = await database.getCartItems(user!.id);
        if (items) {
            setCartItems(items);
        }
        setLoading(false);
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
                                    onClick={() => handleDecrement(item.product_id, item.variant_id)}
                                    className="h-8 w-8 bg-gray-200 hover:bg-gray-300 rounded"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => handleIncrement(item.product_id, item.variant_id)}
                                    className="h-8 w-8 bg-gray-200 hover:bg-gray-300 rounded"
                                >
                                    +
                                </button>

                                <TrashIcon onClick={() => removeItemFromCart(item.product_id, item.variant_id)} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
