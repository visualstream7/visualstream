import { createCanvas, loadImage } from "canvas";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { product_image_url, image_url, x, y, scale } = req.body;

  if (
    !product_image_url ||
    !image_url ||
    x === undefined ||
    y === undefined ||
    scale === undefined
  ) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  try {
    const productImage = await loadImage(product_image_url);
    const overlayImage = await loadImage(image_url);

    const canvas = createCanvas(productImage.width, productImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(productImage, 0, 0, productImage.width, productImage.height);

    const overlayWidth = overlayImage.width * scale;
    const overlayHeight = overlayImage.height * scale;

    ctx.drawImage(overlayImage, x, y, overlayWidth, overlayHeight);

    const base64Image = canvas.toDataURL();

    res.status(200).json({ base64Image });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the images." });
  }
}
