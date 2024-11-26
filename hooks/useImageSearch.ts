import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { SupabaseWrapper } from "@/database/supabase";
import { useEffect, useState } from "react";

export default function useImageSearch() {
  const [loading, setLoading] = useState<boolean>(false);
  const [images, setImages] = useState<Image[]>([]);
  const client = new SupabaseWrapper("CLIENT");

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      const { result, error } = await client.getImages();
      console.log(result, error);
      if (!error && result && result.length > 0) {
        setImages(result);
      }
      setLoading(false);
    }

    fetchImages();
  }, []);

  return { images: images, isImagesLoading: loading };
}
