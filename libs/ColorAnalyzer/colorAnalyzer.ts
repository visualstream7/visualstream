import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { createCanvas, loadImage } from "canvas";
import quantize from "quantize";
export type ImageWithSimilarity = Image & { similarity: number };

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface QuantizedColor {
  color: string;
  percentage: number;
}

class ColorAnalyzer {
  private imageUrl: string;
  private maxColors: number;

  constructor(imageUrl?: string, maxColors?: number) {
    if (!imageUrl || !maxColors) {
      this.imageUrl = imageUrl ? imageUrl : "";
      this.maxColors = 7;
    } else {
      this.imageUrl = imageUrl;
      this.maxColors = maxColors;
    }
  }

  private hexToRgb(hex: string): RGB {
    const hexValue = hex.replace("#", "");
    return {
      r: parseInt(hexValue.substring(0, 2), 16),
      g: parseInt(hexValue.substring(2, 4), 16),
      b: parseInt(hexValue.substring(4, 6), 16),
    };
  }

  private buildRgb(imageData: Uint8ClampedArray): RGB[] {
    const rgbValues: RGB[] = [];
    for (let i = 0; i < imageData.length; i += 4) {
      rgbValues.push({
        r: imageData[i],
        g: imageData[i + 1],
        b: imageData[i + 2],
      });
    }
    return rgbValues;
  }

  private rgbToHex(pixel: RGB): string {
    const componentToHex = (c: number): string =>
      c.toString(16).padStart(2, "0");
    return `#${componentToHex(pixel.r)}${componentToHex(pixel.g)}${componentToHex(pixel.b)}`.toUpperCase();
  }

  private rgbToLab([r, g, b]: number[]): number[] {
    // return [r, g, b];
    // Convert RGB to a scale of 0 to 1
    r /= 255;
    g /= 255;
    b /= 255;

    // Convert RGB to linear space
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Convert to XYZ color space (reference: D65 illuminant)
    let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    let y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
    let z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

    // Normalize for D65 white point
    x /= 0.95047;
    y /= 1.0;
    z /= 1.08883;

    // Convert to Lab space
    const epsilon = 0.008856; // threshold for linear RGB
    const kappa = 903.3; // used in conversion formula

    x = x > epsilon ? Math.cbrt(x) : (kappa * x + 16) / 116;
    y = y > epsilon ? Math.cbrt(y) : (kappa * y + 16) / 116;
    z = z > epsilon ? Math.cbrt(z) : (kappa * z + 16) / 116;

    // Calculate Lab values
    const lab_l = 116 * y - 16;
    const lab_a = 500 * (x - y);
    const lab_b = 200 * (y - z);

    return [lab_l, lab_a, lab_b];
  }

  private async getImageData(): Promise<Uint8ClampedArray | null> {
    const response = await fetch(this.imageUrl);
    const imageBuffer = await response.arrayBuffer();
    const image = await loadImage(Buffer.from(imageBuffer));
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    const { data } = ctx.getImageData(0, 0, image.width, image.height);
    return data;
  }

  private hexToLab(hex: string): number[] {
    return this.rgbToLab(Object.values(this.hexToRgb(hex)));
  }

  private ciede2000(lab1: number[], lab2: number[]): number {
    return Math.sqrt(
      (lab1[0] - lab2[0]) ** 2 +
        (lab1[1] - lab2[1]) ** 2 +
        (lab1[2] - lab2[2]) ** 2,
    );
  }
  private calculateSimilarityScore(
    colorPercentage: QuantizedColor[],
    userColors: { hex: string; percentage: number }[],
  ): number {
    let score = 0;
    const maxPossibleDistance = 100; // Maximum possible CIEDE2000 distance (range: 0-100)
    const maxColorDifferenceWeight = 0.5; // Adjust weights if needed
    const maxPercentageDifferenceWeight = 0.5;
    const missingColorPenaltyWeight = 0.02; // Penalty weight for missing colors

    // For each user-selected color
    userColors.forEach((userColor) => {
      const userLab = this.hexToLab(userColor.hex);
      let bestMatchDistance = Infinity;
      let bestMatchPercentageDiff = 100;

      // Find the best match from the image colors
      colorPercentage.forEach((imageColor) => {
        const imageLab = this.hexToLab(imageColor.color);
        const distance = this.ciede2000(userLab, imageLab);
        if (distance < bestMatchDistance) {
          bestMatchDistance = distance;
          bestMatchPercentageDiff = Math.abs(
            userColor.percentage - imageColor.percentage,
          );
        }
      });

      const colorSimilarity = 1 - bestMatchDistance / maxPossibleDistance;
      const percentageSimilarity = 1 - bestMatchPercentageDiff / 100;

      score +=
        colorSimilarity * maxColorDifferenceWeight +
        percentageSimilarity * maxPercentageDifferenceWeight;

      // score +=
      //   colorSimilarity * maxColorDifferenceWeight +
      //   percentageSimilarity * maxPercentageDifferenceWeight;
    });

    // // Handle missing colors from the user's input
    // const unmatchedImageColors = colorPercentage.filter(
    //   (imageColor) =>
    //     !userColors.some((userColor) => {
    //       const distance = this.ciede2000(
    //         this.hexToLab(userColor.hex),
    //         this.hexToLab(imageColor.color),
    //       );
    //       return distance < maxPossibleDistance * 0.1; // Threshold for a "match"
    //     }),
    // );

    // // Apply a penalty for each unmatched image color
    // score -= unmatchedImageColors.length * missingColorPenaltyWeight;

    // Normalize score to ensure it stays within 0-1 range
    score = Math.max(score / userColors.length, 0);

    return score;
  }

  public getImagesWithSimilarity(
    images: Image[],
    userColors: { hex: string; percentage: number }[],
  ): ImageWithSimilarity[] {
    let imagesWithSimilarity = images.map((image) => {
      let similarity = this.calculateSimilarityScore(
        // @ts-ignore
        image.color_composition as QuantizedColor[],
        userColors,
      );
      return { ...image, similarity };
    });

    // sort by similarity (high to low)

    let sortedImages = imagesWithSimilarity.sort(
      (a, b) => b.similarity - a.similarity,
    );
    return sortedImages;
  }

  public async getColorComposition(): Promise<{
    result: QuantizedColor[] | null;
    error: string | null;
  }> {
    try {
      const imageData = await this.getImageData();
      if (!imageData) {
        throw new Error("Image data is empty");
      }

      const rgbArrayOfPixels = this.buildRgb(imageData).map((pixel) => [
        pixel.r,
        pixel.g,
        pixel.b,
      ]) as [number, number, number][];

      const colorMap = quantize(rgbArrayOfPixels, this.maxColors);

      if (!colorMap) {
        throw new Error("Failed to quantize colors");
      }

      const colorCountMap = new Map<string, number>();
      const totalPixels = rgbArrayOfPixels.length;

      for (let pixel of rgbArrayOfPixels) {
        const color = colorMap.map(pixel);
        const hexColor = this.rgbToHex({
          r: color[0],
          g: color[1],
          b: color[2],
        });

        const pixelCount = colorCountMap.get(hexColor) || 0;
        colorCountMap.set(hexColor, pixelCount + 1);
      }

      // Calculate percentage
      colorCountMap.forEach((count, color) => {
        colorCountMap.set(color, (count / totalPixels) * 100);
      });

      const arrayOfColorCount = Array.from(colorCountMap).map(
        ([color, percentage]) => ({
          color: color,
          percentage: percentage || 0,
        }),
      ) as QuantizedColor[];

      return {
        result: arrayOfColorCount,
        error: null,
      };
    } catch (error) {
      let message = "failed to process image colors";
      if (error instanceof Error) {
        message = error.message;
      }

      return {
        result: null,
        error: message,
      };
    }
  }
}

export default ColorAnalyzer;
