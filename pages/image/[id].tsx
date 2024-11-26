import { FullPageSpinner } from "@/components/spinners/fullPageSpiner";
import ImagePage from "@/components/image/imagePage";
import { useUser } from "@clerk/nextjs";

export default function Image() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <FullPageSpinner />;

  return <ImagePage user={user} />;
}
