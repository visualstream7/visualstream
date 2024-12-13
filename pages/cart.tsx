import Cart from "@/components/cart/cartPage";
import ProductPage from "@/components/product/productPage";
import { FullPageSpinner } from "@/components/spinners/fullPageSpiner";
import { useUser } from "@clerk/nextjs";
export default function Product() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <FullPageSpinner />;

  return (
    <div>
      <Cart user={user} />
    </div>
  );
}
