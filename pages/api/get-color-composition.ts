import { createCanvas, loadImage } from "canvas";
import quantize from "quantize";
interface RGB {
  r: number;
  g: number;
  b: number;
}

interface QuantizedColor {
  color: string;
  percentage: number;
}

function hexToRgb(hex: string): RGB {
  const hexValue = hex.replace("#", "");
  return {
    r: parseInt(hexValue.substring(0, 2), 16),
    g: parseInt(hexValue.substring(2, 4), 16),
    b: parseInt(hexValue.substring(4, 6), 16),
  };
}

const buildRgb = (imageData: Uint8ClampedArray): RGB[] => {
  const rgbValues: RGB[] = [];
  for (let i = 0; i < imageData.length; i += 4) {
    rgbValues.push({
      r: imageData[i],
      g: imageData[i + 1],
      b: imageData[i + 2],
    });
  }
  return rgbValues;
};

const rgbToHex = (pixel: RGB): string => {
  const componentToHex = (c: number): string => c.toString(16).padStart(2, "0");
  return `#${componentToHex(pixel.r)}${componentToHex(pixel.g)}${componentToHex(pixel.b)}`.toUpperCase();
};

export default async function handler(
  req: { method: string; body: { image_url: string } },
  res: any,
) {
  if (req.method === "POST") {
    const { image_url } = req.body;
    if (!image_url) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    try {
      const response = await fetch(image_url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image, status: ${response.status}`);
      }
      let maximumColorCount = 5;

      const imageBuffer = await response.arrayBuffer();
      const image = await loadImage(Buffer.from(imageBuffer));
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);

      const { data } = ctx.getImageData(0, 0, image.width, image.height);
      const rgbArrayOfPixels = buildRgb(data).map((pixel) => [
        pixel.r,
        pixel.g,
        pixel.b,
      ]) as [number, number, number][];

      let colorMap = quantize(rgbArrayOfPixels, maximumColorCount);

      let colorCountMap = new Map<string, number>();
      const totalPixels = rgbArrayOfPixels.length;

      for (let pixel of rgbArrayOfPixels) {
        // @ts-ignore
        let color = colorMap.map(pixel);
        let hexColor = rgbToHex({
          r: color[0],
          g: color[1],
          b: color[2],
        });
        let pixelCount = colorCountMap.get(hexColor) || 0;
        let hasColor = colorCountMap.has(hexColor);
        if (!hasColor) {
          colorCountMap.set(hexColor, 1);
        }
        if (hasColor) {
          colorCountMap.set(hexColor, pixelCount + 1);
        }
      }

      // Using a Map's built-in methods for iteration
      colorCountMap.forEach((count, color) => {
        colorCountMap.set(color, (count / totalPixels) * 100);
      });

      let arrayOfColorCount = Array.from(colorCountMap).map(
        ([color, percentage]) => ({
          color: color,
          percentage: percentage,
        }),
      ) as QuantizedColor[];

      // @ts-ignore
      res.status(200).json({ colorPercentage: arrayOfColorCount });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: "Failed to process image", details: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
