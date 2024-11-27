import { FullPageSpinner } from "@/components/spinners/fullPageSpiner";
import ImagePage from "@/components/image/imagePage";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import useImage from "@/hooks/useImage";

export default function Image() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const id = parseInt(router.query.id as string);

  const { image, loading } = useImage(id);
  if (!isLoaded || loading || !image) return <FullPageSpinner />;

  return <ImagePage user={user} image={image} />;
}
