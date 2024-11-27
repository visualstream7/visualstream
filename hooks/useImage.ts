import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { SupabaseWrapper } from "@/database/supabase";
import { useEffect, useState } from "react";

export default function useImage(id: number) {
  const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<Image | null>(null);
  const client = new SupabaseWrapper("CLIENT");
  useEffect(() => {
    async function fetchImage(id: number) {
      setLoading(true);
      let { result, error } = await client.getImage(id);

      if (!error && result) {
        setImage(result);
        setLoading(false);
      }
    }

    if (id) fetchImage(id);
  }, [id]);

  return {
    loading,
    image,
  };
}
