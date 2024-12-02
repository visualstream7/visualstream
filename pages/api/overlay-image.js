import { createCanvas, loadImage } from "canvas";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    product_image_url,
    image_url,
    x,
    y,
    w,
    h,
    box_x,
    box_y,
    box_w,
    box_h,
  } = req.body;

  if (
    !product_image_url ||
    !image_url ||
    x === undefined ||
    y === undefined ||
    w === undefined ||
    h === undefined ||
    box_x === undefined ||
    box_y === undefined ||
    box_w === undefined ||
    box_h === undefined
  ) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  try {
    const productImage = await loadImage(product_image_url);
    const overlayImage = await loadImage(image_url);

    const canvas = createCanvas(productImage.width, productImage.height);
    const ctx = canvas.getContext("2d");

    // Draw the product image
    ctx.drawImage(productImage, 0, 0, productImage.width, productImage.height);

    // Save the part of the product image in the box region
    const boxRegion = ctx.getImageData(box_x, box_y, box_w, box_h);

    // Draw the overlay image
    ctx.drawImage(overlayImage, x, y, w, h);

    // Restore the product image in the box region
    ctx.putImageData(boxRegion, box_x, box_y);

    // Convert the canvas to a Base64 image
    const base64Image = canvas.toDataURL();

    res.status(200).json({ base64Image });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the images." });
  }
}
