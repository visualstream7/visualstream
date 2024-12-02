import { useState } from "react";

export default function Home() {
  const [productImageUrl, setProductImageUrl] = useState("");
  const [overlayImageUrl, setOverlayImageUrl] = useState("");
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [scale, setScale] = useState(1);
  const [resultImage, setResultImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/overlay-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_image_url: productImageUrl,
        image_url: overlayImageUrl,
        x,
        y,
        scale,
      }),
    });

    const data = await response.json();
    if (data.base64Image) {
      setResultImage(data.base64Image);
    } else {
      alert("Error creating image");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Image Overlay Tool</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div>
          <label>Product Image URL:</label>
          <input
            type="text"
            value={productImageUrl}
            onChange={(e) => setProductImageUrl(e.target.value)}
            placeholder="Enter product image URL"
            required
          />
        </div>
        <div>
          <label>Overlay Image URL:</label>
          <input
            type="text"
            value={overlayImageUrl}
            onChange={(e) => setOverlayImageUrl(e.target.value)}
            placeholder="Enter overlay image URL"
            required
          />
        </div>
        <div>
          <label>X Position:</label>
          <input
            type="number"
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            placeholder="X"
            required
          />
        </div>
        <div>
          <label>Y Position:</label>
          <input
            type="number"
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
            placeholder="Y"
            required
          />
        </div>
        <div>
          <label>Scale:</label>
          <input
            type="number"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            placeholder="Scale (e.g., 0.5)"
            required
          />
        </div>
        <button type="submit" style={{ marginTop: "10px" }}>
          Generate Mockup
        </button>
      </form>

      {resultImage && (
        <div>
          <h2>Resulting Image:</h2>
          <img src={resultImage} alt="Result" style={{ maxWidth: "100%" }} />
        </div>
      )}
    </div>
  );
}
