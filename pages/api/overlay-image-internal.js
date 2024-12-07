import { createCanvas, loadImage } from "canvas";
import { utapi } from "@/libs/uploadthing";
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
    box_roundness,
    overlay_roundness,
    is_cropped,
  } = req.body;

  // Validate required parameters
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
    box_h === undefined ||
    box_roundness === undefined ||
    overlay_roundness === undefined ||
    is_cropped === undefined
  ) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  try {
    // Load the product and overlay images
    const productImage = await loadImage(product_image_url);
    const overlayImage = await loadImage(image_url);

    // Create a canvas matching the product image size
    const canvas = createCanvas(productImage.width, productImage.height);
    const ctx = canvas.getContext("2d");

    // Draw the product image as the base layer
    ctx.drawImage(productImage, 0, 0, productImage.width, productImage.height);

    // Handle the overlay image
    ctx.save();

    // Apply roundness to the overlay area
    ctx.beginPath();
    ctx.moveTo(x + overlay_roundness, y);
    ctx.lineTo(x + w - overlay_roundness, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + overlay_roundness);
    ctx.lineTo(x + w, y + h - overlay_roundness);
    ctx.quadraticCurveTo(x + w, y + h, x + w - overlay_roundness, y + h);
    ctx.lineTo(x + overlay_roundness, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - overlay_roundness);
    ctx.lineTo(x, y + overlay_roundness);
    ctx.quadraticCurveTo(x, y, x + overlay_roundness, y);
    ctx.clip();

    if (is_cropped) {
      // Crop overlay image to fit within the specified dimensions
      const overlayAspectRatio = overlayImage.width / overlayImage.height;
      const boxAspectRatio = w / h;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (overlayAspectRatio > boxAspectRatio) {
        drawHeight = h;
        drawWidth = overlayImage.width * (h / overlayImage.height);
        offsetX = x - (drawWidth - w) / 2;
        offsetY = y;
      } else {
        drawWidth = w;
        drawHeight = overlayImage.height * (w / overlayImage.width);
        offsetX = x;
        offsetY = y - (drawHeight - h) / 2;
      }

      ctx.drawImage(overlayImage, offsetX, offsetY, drawWidth, drawHeight);
    } else {
      // Stretch the overlay image to fit the specified box dimensions
      ctx.drawImage(overlayImage, x, y, w, h);
    }

    ctx.restore();

    // Handle the transparency box
    ctx.save();

    // Apply roundness to the transparency box
    ctx.beginPath();
    ctx.moveTo(box_x + box_roundness, box_y);
    ctx.lineTo(box_x + box_w - box_roundness, box_y);
    ctx.quadraticCurveTo(
      box_x + box_w,
      box_y,
      box_x + box_w,
      box_y + box_roundness,
    );
    ctx.lineTo(box_x + box_w, box_y + box_h - box_roundness);
    ctx.quadraticCurveTo(
      box_x + box_w,
      box_y + box_h,
      box_x + box_w - box_roundness,
      box_y + box_h,
    );
    ctx.lineTo(box_x + box_roundness, box_y + box_h);
    ctx.quadraticCurveTo(
      box_x,
      box_y + box_h,
      box_x,
      box_y + box_h - box_roundness,
    );
    ctx.lineTo(box_x, box_y + box_roundness);
    ctx.quadraticCurveTo(box_x, box_y, box_x + box_roundness, box_y);
    ctx.clip();

    // Reveal the product image within the transparency box
    ctx.drawImage(productImage, 0, 0, productImage.width, productImage.height);

    ctx.restore();

    // Convert the final canvas to a Base64 image
    const base64Image = canvas.toDataURL();

    // Function to convert Base64 to a File object
    function base64ToFile(base64, filename) {
      const arr = base64.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]); // Decode Base64 string
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], filename, { type: mime });
    }

    // Convert the Base64 string to a File
    const imageFile = base64ToFile(base64Image, "image.png");

    // Upload the file using your existing upload function
    // let highResUpload = await utapi.uploadFiles(imageFile);
    // console.log("highResUpload", highResUpload.data.url);
    res.status(200).json({ base64Image });

    //res.status(200).json({ base64Image, url: highResUpload.data.url });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the images." });
  }
}
