import ProductPage from "@/components/product/productPage";
import { FullPageSpinner } from "@/components/spinners/fullPageSpiner";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
export default function Product() {
  const router = useRouter();

  const imageId = router.query.image_id as string;

  const { user, isLoaded } = useUser();

  const id = router.query.id as string;

  if (!isLoaded || !id) return <FullPageSpinner />;

  return (
    <div>
      <ProductPage id={id} image_id={imageId} user={user} />
    </div>
  );
}
