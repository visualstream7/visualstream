import ProductPage from "@/components/product/productPage";
import { useRouter } from "next/router";
export default function Product() {
  const router = useRouter();

  const imageId = router.query.image_id as string;
  const id = router.query.id as string;

  return (
    <div>
      <ProductPage id={id} image_id={imageId} />
    </div>
  );
}
