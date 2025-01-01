// import { createCanvas, loadImage } from "canvas";

// function calculateHeightWidthFromPoints(points) {
//   let minX = points[0].x;
//   let minY = points[0].y;
//   let maxX = points[0].x;
//   let maxY = points[0].y;

//   for (let i = 1; i < points.length; i++) {
//     const { x, y } = points[i];
//     if (x < minX) {
//       minX = x;
//     }
//     if (x > maxX) {
//       maxX = x;
//     }

//     if (y < minY) {
//       minY = y;
//     }

//     if (y > maxY) {
//       maxY = y;
//     }
//   }

//   return {
//     minX: minX,
//     minY: minY,
//     width: maxX - minX,
//     height: maxY - minY,
//   };
// }

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   const { baseImageUrl, overlayImageUrl, points } = req.body;

//   try {
//     const canvas = createCanvas(700, 1000);
//     const context = canvas.getContext("2d");

//     const baseImage = await loadImage(baseImageUrl);
//     const overlayImage = await loadImage(overlayImageUrl);

//     console.log(
//       "overlayImage.height, overlayImage.width",
//       overlayImage.height,
//       overlayImage.width,
//     );
//     console.log(
//       "baseImage.height, baseImage.width",
//       baseImage.height,
//       baseImage.width,
//     );

//     let { width, height, minX, minY } = calculateHeightWidthFromPoints(points);
//     console.log("width, height of selected points area", width, height);

//     context.drawImage(baseImage, 0, 0, 700, 1000);

//     context.beginPath();
//     if (points.length > 0) {
//       context.moveTo(points[0].x, points[0].y);
//       for (let i = 1; i < points.length; i++) {
//         const midPointX = (points[i - 1].x + points[i].x) / 2;
//         const midPointY = (points[i - 1].y + points[i].y) / 2;
//         context.quadraticCurveTo(
//           points[i - 1].x,
//           points[i - 1].y,
//           midPointX,
//           midPointY,
//         );
//       }
//       if (points.length > 2) {
//         context.quadraticCurveTo(
//           points[points.length - 1].x,
//           points[points.length - 1].y,
//           points[0].x,
//           points[0].y,
//         );
//       }
//     }
//     context.closePath();
//     context.clip();

//     // context.drawImage(overlayImage, 100, 100, 650, 700); // for backpack
//     context.drawImage(overlayImage, minX, minY, width, height); // for mug
//     // context.drawImage(overlayImage, 0, 0, 700, 1000); // for tshirt

//     const outputBuffer = canvas.toBuffer("image/png");
//     res.setHeader("Content-Type", "image/png");
//     res.send(outputBuffer);
//   } catch (error) {
//     console.error("Error processing images", error);
//     res.status(500).json({ message: "Error processing images", error });
//   }
// }

export default function cropBackpack() {
  return <div></div>;
}
