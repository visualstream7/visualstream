import { createCanvas, loadImage } from "canvas";
import { utapi } from "@/libs/uploadthing";

// This function can run for a maximum of 5 seconds
export const config = {
  maxDuration: 40,
};

function calculateHeightWidthFromPoints(points) {
  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;

  for (let i = 1; i < points.length; i++) {
    const { x, y } = points[i];
    if (x < minX) {
      minX = x;
    }
    if (x > maxX) {
      maxX = x;
    }

    if (y < minY) {
      minY = y;
    }

    if (y > maxY) {
      maxY = y;
    }
  }

  return {
    minX: minX,
    minY: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { baseImageUrl, overlayImageUrl, points } = req.body;

  try {
    const canvas = createCanvas(700, 1000);
    const context = canvas.getContext("2d");

    const baseImage = await loadImage(baseImageUrl);
    const overlayImage = await loadImage(overlayImageUrl);

    console.log(
      "overlayImage.height, overlayImage.width",
      overlayImage.height,
      overlayImage.width,
    );
    console.log(
      "baseImage.height, baseImage.width",
      baseImage.height,
      baseImage.width,
    );

    let { width, height, minX, minY } = calculateHeightWidthFromPoints(points);
    console.log("width, height of selected points area", width, height);

    context.drawImage(baseImage, 0, 0, 700, 1000);

    context.beginPath();
    if (points.length > 0) {
      context.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const midPointX = (points[i - 1].x + points[i].x) / 2;
        const midPointY = (points[i - 1].y + points[i].y) / 2;
        context.quadraticCurveTo(
          points[i - 1].x,
          points[i - 1].y,
          midPointX,
          midPointY,
        );
      }
      if (points.length > 2) {
        context.quadraticCurveTo(
          points[points.length - 1].x,
          points[points.length - 1].y,
          points[0].x,
          points[0].y,
        );
      }
    }
    context.closePath();
    context.clip();

    // context.drawImage(overlayImage, 100, 100, 650, 700); // for backpack
    context.drawImage(overlayImage, minX, minY, width, height); // for mug
    // context.drawImage(overlayImage, 0, 0, 700, 1000); // for tshirt

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
    const imageFile = base64ToFile(base64Image, "mock.png");

    // Upload the file using your existing upload function
    let highResUpload = await utapi.uploadFiles(imageFile);

    return res.status(200).json({ url: highResUpload?.data?.url || null });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the images." });
  }
}
