import { createCanvas, loadImage } from "canvas";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Base backpack image URL
      const baseImageUrl =
        "https://files.cdn.printful.com/products/279/9063_1534847488.jpg";

      // Extract parameters from the request body
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required." });
      }

      // 1000 x 700

      const defaultSafeArea = {
        x: 250,
        y: 100,
        width: 500,
        height: 500,
      };

      // Load the base backpack image
      const baseImage = await loadImage(baseImageUrl);

      // Load the overlay image
      const overlayImage = await loadImage(imageUrl);

      // Create a canvas with the dimensions of the base backpack image
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      // Draw the base backpack image onto the canvas
      ctx.drawImage(baseImage, 0, 0, baseImage.width, baseImage.height);

      // Save the current context state
      ctx.save();

      // Define the backpack shape as a clipping path
      ctx.beginPath();
      ctx.moveTo(100, 50); // Top-left corner of the safe print area
      // Draw the backpack shape
      ctx.bezierCurveTo(150, 20, 850, 20, 900, 50); // Top curve
      ctx.lineTo(900, 400); // Straight down the right side
      ctx.bezierCurveTo(850, 450, 150, 450, 100, 400); // Bottom curve
      ctx.closePath();

      // Clip the canvas to the defined shape
      ctx.clip();

      ctx.clip(); // Apply the clipping path

      // Draw the overlay image onto the canvas (cropped by the clipping path)
      ctx.drawImage(
        overlayImage,
        defaultSafeArea.x,
        defaultSafeArea.y,
        defaultSafeArea.width,
        defaultSafeArea.height,
      );

      // Restore the context to remove the clipping path
      ctx.restore();

      // Return the processed image as a Base64 string
      const outputBase64 = canvas.toDataURL("image/png");

      res.setHeader("Content-Type", "application/json");
      res.send(
        JSON.stringify({
          image: outputBase64,
          height: canvas.height,
          width: canvas.width,
        }),
      );
    } catch (error) {
      console.error("Image processing failed:", error);
      res.status(500).json({ error: "Image processing failed." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}
