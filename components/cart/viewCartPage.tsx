import { SupabaseWrapper } from "@/database/supabase";
import { UserResource } from "@clerk/types";
import { useEffect } from "react";

interface ProductPageProps {
    user: UserResource | null | undefined;
}


const database = new SupabaseWrapper("CLIENT");
export default function Cart({ user }: ProductPageProps) {

    


    useEffect(() => {

        async function fetchCartData() {
            const { result, error } = await database.getCartItems(user!.id);
            console.log("cart", result, error);
        }

        if (user) { fetchCartData(); }
    }, [user]);

    return (
        <div>
            Cart
        </div>
    )
}