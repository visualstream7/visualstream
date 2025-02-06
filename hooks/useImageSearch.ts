import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { SupabaseWrapper } from "@/database/supabase";
import ColorAnalyzer, {
  ImageWithSimilarity,
} from "@/libs/ColorAnalyzer/colorAnalyzer";
import { useEffect, useState } from "react";

const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

const rgbToLab = (r: number, g: number, b: number) => {
  let X, Y, Z;
  const [xr, yr, zr] = [0.964221, 1.0, 0.825211]; // reference white D50

  const transform = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  // Convert RGB to linear RGB
  r = transform(r / 255);
  g = transform(g / 255);
  b = transform(b / 255);

  // Linear RGB to XYZ
  X = r * 0.436052025 + g * 0.385081593 + b * 0.143087414;
  Y = r * 0.222491598 + g * 0.71688606 + b * 0.060621486;
  Z = r * 0.013929122 + g * 0.097097002 + b * 0.71418547;

  const labTransform = (t: number) =>
    t > 216 / 24389 ? Math.pow(t, 1 / 3) : ((24389 / 27) * t + 16) / 116;

  // Normalize to Lab
  const L = 116 * labTransform(Y / yr) - 16;
  const A = 500 * (labTransform(X / xr) - labTransform(Y / yr));
  const B = 200 * (labTransform(Y / yr) - labTransform(Z / zr));

  return [L, A, B];
};

// function to calculate the color similarity
function calculateColorSimilarity(color1: string, color2: string) {
  // color1 and color2 are hex strings
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const lab1 = rgbToLab(rgb1[0], rgb1[1], rgb1[2]);
  const lab2 = rgbToLab(rgb2[0], rgb2[1], rgb2[2]);

  const deltaE = Math.sqrt(
    Math.pow(lab2[0] - lab1[0], 2) +
      Math.pow(lab2[1] - lab1[1], 2) +
      Math.pow(lab2[2] - lab1[2], 2),
  );

  const MAX_similarity = 119.84;
  let normalizedsimilarity = Math.min(1, deltaE / MAX_similarity);
  normalizedsimilarity = 1 - normalizedsimilarity;
  normalizedsimilarity = Math.round(normalizedsimilarity * 100);

  return normalizedsimilarity;
}

function calculatePercentageSimilarity(
  expectedPercentage: number,
  currentPercentage: number,
) {
  let lowerPercentage =
    expectedPercentage > currentPercentage
      ? currentPercentage
      : expectedPercentage;

  let higherPercentage =
    expectedPercentage > currentPercentage
      ? expectedPercentage
      : currentPercentage;

  let percentageSimilarity = (lowerPercentage / higherPercentage) * 100;

  return percentageSimilarity.toFixed(4);
}

function calculateTotalSimilarity(
  colorSimilarity: number,
  percentageSimilarity: number,
  colorWeight = 0.8,
  percentageWeight = 0.2,
) {
  // Ensure weights sum up to 1
  const totalWeight = colorWeight + percentageWeight;
  colorWeight /= totalWeight;
  percentageWeight /= totalWeight;

  // Calculate total similarity
  const totalSimilarity =
    colorSimilarity * colorWeight + percentageSimilarity * percentageWeight;
  return totalSimilarity;
}

function overallSimilarity(selectedColors: any, colorComposition: any) {
  let totalSimilarity = 0;

  // Iterate over each selected color
  for (let i = 0; i < selectedColors.length; i++) {
    const selectedColor = selectedColors[i];
    let maxSimilarity = 0;
    let maxPalettePercentage = 0;

    // Iterate over each palette in the color composition
    for (let j = 0; j < colorComposition.length; j++) {
      const palette = colorComposition[j];

      // Calculate individual similarity metrics
      const colorSimilarity = calculateColorSimilarity(
        palette.color,
        selectedColor.hex,
      );

      const percentageSimilarity = calculatePercentageSimilarity(
        palette.percentage,
        selectedColor.percentage,
      );

      const totalSimilarityValue = calculateTotalSimilarity(
        colorSimilarity,
        parseInt(percentageSimilarity),
      );

      // Track the maximum similarity for the current selected color
      if (totalSimilarityValue > maxSimilarity) {
        maxSimilarity = totalSimilarityValue;
        maxPalettePercentage = palette.percentage;
      }
    }
    totalSimilarity += (maxSimilarity * maxPalettePercentage) / 100;
  }
  return totalSimilarity;
}

export default function useImageSearch({
  selectedColors,
  selectedCategory,
  searchTags,
  isResizing,
}: {
  selectedColors: { hex: string; percentage: number }[];
  selectedCategory: string;
  searchTags: string[];
  isResizing: number | null;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [images, setImages] = useState<ImageWithSimilarity[]>([]);
  const [searchTagImages, setSearchTagImages] = useState<ImageWithSimilarity[]>(
    [],
  );
  const [unorderedImages, setUnorderedImages] = useState<ImageWithSimilarity[]>(
    [],
  );
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
        if (selectedCategory === "All") {
          setUnorderedImages(resultWithSimilarity);
          setImages(resultWithSimilarity);
        } else {
          setUnorderedImages(
            resultWithSimilarity.filter((image) =>
              image?.category
                ?.toLowerCase()
                .includes(selectedCategory.toLowerCase()),
            ),
          );
          setImages(
            resultWithSimilarity.filter((image) =>
              image?.category
                ?.toLowerCase()
                .includes(selectedCategory.toLowerCase()),
            ),
          );
        }
        setLoading(false);
      }
    }

    fetchImages();
  }, [selectedCategory]);

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

  useEffect(() => {
    if (
      !images ||
      images.length === 0 ||
      !searchTags ||
      searchTags.length === 0
    ) {
      return;
    }
    console.log("Search tags changed", searchTags);

    let imagesWithCountScore = images.map((image) => {
      let countScore = 0;

      if (!image.ai_tags) {
        return {
          ...image,
          countScore,
        };
      }

      let AI_DESCRIBE = image.ai_describe?.toLowerCase() || "";
      let AI_ARTICLE_DESCRIBE = image.ai_article_describe?.toLowerCase() || "";
      let AI_TAGS = image.ai_tags?.toLowerCase() || "";

      let SEARCH_SPACE =
        AI_DESCRIBE + " " + AI_ARTICLE_DESCRIBE + " " + AI_TAGS;
      SEARCH_SPACE = SEARCH_SPACE.toLowerCase();

      for (let i = 0; i < searchTags.length; i++) {
        let tag = searchTags[i].toLowerCase();

        let ARRAY_OF_SEARCH_SPACE = SEARCH_SPACE.split(" ");
        let count = 0;
        for (let j = 0; j < ARRAY_OF_SEARCH_SPACE.length; j++) {
          if (ARRAY_OF_SEARCH_SPACE[j].includes(tag)) {
            count++;
          }
        }
        countScore += count;
      }

      return {
        ...image,
        search_space: SEARCH_SPACE,
        countScore,
      };
    });

    imagesWithCountScore = imagesWithCountScore.sort(
      (a, b) => b.countScore - a.countScore,
    );

    (imagesWithCountScore = imagesWithCountScore.filter(
      (image) => image.countScore && image.countScore > 0,
    )),
      // if countScore is 0 or undefined, then the image is not relevant

      setSearchTagImages(imagesWithCountScore);
    console.log("Search tag images", imagesWithCountScore);
  }, [searchTags, images]);

  function returnableImages() {
    // if no color is selected
    if (selectedColors.length === 0) {
      if (searchTags?.length > 0) {
        return searchTagImages;
      } else {
        return unorderedImages;
      }
    } else {
      if (searchTags?.length === 0) {
        return images;
      } else {
        let searchTagImagesIDs = searchTagImages.map((image) => image.id);
        return images.filter((image) => searchTagImagesIDs.includes(image.id));
      }
    }
  }

  return {
    images: returnableImages(),
    isImagesLoading: loading,
  };
}
