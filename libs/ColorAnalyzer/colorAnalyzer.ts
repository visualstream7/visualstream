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
      this.maxColors = 5;
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

  private calculateSimilarityScore(
    colorPercentage: QuantizedColor[],
    userColors: { hex: string; percentage: number }[],
  ): number {
    return Math.random();
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
          percentage: percentage.toFixed(2) || 0,
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
