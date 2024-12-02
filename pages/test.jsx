import { useState } from "react";

export default function Home() {
  const [productImageUrl, setProductImageUrl] = useState("");
  const [overlayImageUrl, setOverlayImageUrl] = useState("");
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [w, setW] = useState(100);
  const [h, setH] = useState(100);
  const [boxX, setBoxX] = useState(0);
  const [boxY, setBoxY] = useState(0);
  const [boxW, setBoxW] = useState(50);
  const [boxH, setBoxH] = useState(50);
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
        w,
        h,
        box_x: boxX,
        box_y: boxY,
        box_w: boxW,
        box_h: boxH,
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
      <h1>Image Overlay Tool with Transparent Box</h1>
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
          <label>Overlay Width (w):</label>
          <input
            type="number"
            value={w}
            onChange={(e) => setW(Number(e.target.value))}
            placeholder="Width (e.g., 100)"
            required
          />
        </div>
        <div>
          <label>Overlay Height (h):</label>
          <input
            type="number"
            value={h}
            onChange={(e) => setH(Number(e.target.value))}
            placeholder="Height (e.g., 100)"
            required
          />
        </div>
        <div>
          <label>Transparent Box X:</label>
          <input
            type="number"
            value={boxX}
            onChange={(e) => setBoxX(Number(e.target.value))}
            placeholder="Box X"
            required
          />
        </div>
        <div>
          <label>Transparent Box Y:</label>
          <input
            type="number"
            value={boxY}
            onChange={(e) => setBoxY(Number(e.target.value))}
            placeholder="Box Y"
            required
          />
        </div>
        <div>
          <label>Transparent Box Width (box_w):</label>
          <input
            type="number"
            value={boxW}
            onChange={(e) => setBoxW(Number(e.target.value))}
            placeholder="Box Width"
            required
          />
        </div>
        <div>
          <label>Transparent Box Height (box_h):</label>
          <input
            type="number"
            value={boxH}
            onChange={(e) => setBoxH(Number(e.target.value))}
            placeholder="Box Height"
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
