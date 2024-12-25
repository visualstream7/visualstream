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

      const clipPath = [
        { type: "moveTo", x: 10, y: 10 },
        {
          type: "bezierCurveTo",
          cp1x: 0,
          cp1y: 50,
          cp2x: 0,
          cp2y: 0,
          x: 10,
          y: 10,
        },
        { type: "lineTo", x: 750, y: 600 },
        {
          type: "bezierCurveTo",
          cp1x: 800,
          cp1y: 550,
          cp2x: 600,
          cp2y: 650,
          x: 10,
          y: 10,
        },
        { type: "closePath" },
      ];

      ctx.beginPath();
      clipPath.forEach((point, index) => {
        switch (point.type) {
          case "moveTo":
            ctx.moveTo(point.x, point.y);
            break;
          case "lineTo":
            ctx.lineTo(point.x, point.y);
            break;
          case "bezierCurveTo":
            ctx.bezierCurveTo(
              point.cp1x, // First control point x
              point.cp1y, // First control point y
              point.cp2x, // Second control point x
              point.cp2y, // Second control point y
              point.x, // Endpoint x
              point.y, // Endpoint y
            );
            break;
          case "closePath":
            ctx.closePath();
            break;
          default:
            console.error(`Unsupported path type: ${point.type}`);
        }
      });

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
