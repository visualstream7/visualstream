import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { SupabaseWrapper } from "@/database/supabase";
import ColorAnalyzer, {
  ImageWithSimilarity,
} from "@/libs/ColorAnalyzer/colorAnalyzer";
import { useEffect, useState } from "react";

const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

const rgbToLab = (r, g, b) => {
  let X, Y, Z;
  const [xr, yr, zr] = [0.964221, 1.0, 0.825211]; // reference white D50

  const transform = (c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  // Convert RGB to linear RGB
  r = transform(r / 255);
  g = transform(g / 255);
  b = transform(b / 255);

  // Linear RGB to XYZ
  X = r * 0.436052025 + g * 0.385081593 + b * 0.143087414;
  Y = r * 0.222491598 + g * 0.71688606 + b * 0.060621486;
  Z = r * 0.013929122 + g * 0.097097002 + b * 0.71418547;

  const labTransform = (t) =>
    t > 216 / 24389 ? Math.pow(t, 1 / 3) : ((24389 / 27) * t + 16) / 116;

  // Normalize to Lab
  const L = 116 * labTransform(Y / yr) - 16;
  const A = 500 * (labTransform(X / xr) - labTransform(Y / yr));
  const B = 200 * (labTransform(Y / yr) - labTransform(Z / zr));

  return [L, A, B];
};

// function to calculate the color similarity
function calculateColorSimilarity(color1, color2) {
  // color1 and color2 are hex strings
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const lab1 = rgbToLab(...rgb1);
  const lab2 = rgbToLab(...rgb2);

  const deltaE = Math.sqrt(
    Math.pow(lab2[0] - lab1[0], 2) +
      Math.pow(lab2[1] - lab1[1], 2) +
      Math.pow(lab2[2] - lab1[2], 2),
  );

  // normalize the similarity
  // max similarity is 119.84
  // 0 means the colors are identical
  const MAX_similarity = 119.84;
  let normalizedsimilarity = Math.min(1, deltaE / MAX_similarity);
  normalizedsimilarity = 1 - normalizedsimilarity;
  normalizedsimilarity = Math.round(normalizedsimilarity * 100);

  return normalizedsimilarity;
}

function calculatePercentageSimilarity(expectedPercentage, currentPercentage) {
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
  colorSimilarity,
  percentageSimilarity,
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

function overallSimilarity(selectedColors, colorComposition) {
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
        percentageSimilarity,
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

    let maxSimilarity = imagesWithSimilarityScore.reduce(
      (max, image) => Math.max(max, image.similarity),
      0,
    );

    let minSimilarity = imagesWithSimilarityScore.reduce(
      (min, image) => Math.min(min, image.similarity),
      100,
    );

    imagesWithSimilarityScore = imagesWithSimilarityScore.map((image) => {
      return {
        ...image,
        similarity:
          (image.similarity - minSimilarity) / (maxSimilarity - minSimilarity),
      };
    });

    // let imagesWithSimilarityScore = images
    //   .map((image) => {
    //     return {
    //       ...image,
    //       similarity:
    //         overallSimilarity(selectedColors, image.color_composition) / 100,
    //     };
    //   })
    //   .sort((a, b) => b.similarity - a.similarity);
    setImages(imagesWithSimilarityScore);
  }, [isResizing, selectedColors]);

  return { images: images, isImagesLoading: loading };
}
