import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { SupabaseWrapper } from "@/database/supabase";
import { useSession, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function Favourites() {
  const { user, isLoaded } = useUser();
  const [likedImages, setLikedImages] = useState<Image[]>([]);
  useEffect(() => {
    async function fetchLikedImages() {
      let supabase = new SupabaseWrapper("CLIENT");
      const { result, error } = await supabase.getLikedImagesWithDetails(
        user!.id,
      );
      console.log(result, error);
      if (result && result.length > 0) {
        setLikedImages(result);
      }
    }
    if (user) fetchLikedImages();
  }, [user]);

  return (
    <div>
      {likedImages.map((image) => {
        return (
          <div key={image.id}>
            <img
              src={image.low_resolution_image_url || ""}
              alt={image.title || ""}
            />
          </div>
        );
      })}
    </div>
  );
}
