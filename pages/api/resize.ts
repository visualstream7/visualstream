// @ts-nocheck
import { createCanvas, loadImage } from "canvas";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return processImage(req, res);
  } else if (req.method === "POST") {
    return processImage(req, res, true);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

async function processImage(req, res, isPost = false) {
  try {
    let searchParams;
    if (isPost) {
      const body = req.body;
      searchParams = new URLSearchParams(body);
    } else {
      searchParams = new URL(req.url, `http://${req.headers.host}`)
        .searchParams;
    }

    const imageUrl = searchParams.get("imageUrl");
    const width = parseInt(searchParams.get("width")) || null;
    const height = parseInt(searchParams.get("height")) || null;
    const quality = parseInt(searchParams.get("quality")) || 80;

    if (!imageUrl) {
      return res.status(400).json({ error: "Missing imageUrl parameter" });
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const image = await loadImage(imageBuffer);

    const canvas = createCanvas(width || image.width, height || image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const outputBuffer = canvas.toBuffer("image/jpeg", {
      quality: quality / 100,
    });

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return res.end(outputBuffer);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
