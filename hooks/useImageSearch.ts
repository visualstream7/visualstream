import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { SupabaseWrapper } from "@/database/supabase";
import ColorAnalyzer, {
  ImageWithSimilarity,
} from "@/libs/ColorAnalyzer/colorAnalyzer";
import { useEffect, useState } from "react";

export default function useImageSearch({
  selectedColors,
  isResizing,
}: {
  selectedColors: { hex: string; percentage: number }[];
  isResizing: number | null;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [images, setImages] = useState<ImageWithSimilarity[]>([]);
  const client = new SupabaseWrapper("CLIENT");

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      const { result, error } = await client.getImages();
      if (!error && result && result.length > 0) {
        let resultWithSimilarity = result.map((image: Image) => {
          return {
            ...image,
            similarity: 0,
          };
        });
        setImages(resultWithSimilarity), setLoading(false);
      }
    }

    fetchImages();
  }, []);

  useEffect(() => {
    console.log("Selected colors changed", selectedColors, isResizing);
    if (
      isResizing !== null ||
      !selectedColors ||
      selectedColors.length === 0 ||
      images.length === 0 ||
      loading
    ) {
      return;
    }
    let analyzer = new ColorAnalyzer();
    let imagesWithSimilarityScore = analyzer.getImagesWithSimilarity(
      images,
      selectedColors,
    );
    setImages(imagesWithSimilarityScore);
  }, [isResizing, selectedColors]);

  return { images: images, isImagesLoading: loading };
}
