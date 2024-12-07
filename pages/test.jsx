import { useEffect, useState } from "react";

const EXAMPLE_PRODUCT_IMAGE_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQY-nc0L0lxsGWjBBGc7s6cL4tDzZV3-71O_A&s";
const EXAMPLE_OVERLAY_IMAGE_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKLlLGdCSX_Wq7c9SstogkS9rcfdABvnk7tw&s";

const ExampleData = {
  x: 0,
  y: 0,
  w: 100,
  h: 100,
};

export default function Home() {
  const [productImageUrl, setProductImageUrl] = useState(
    EXAMPLE_PRODUCT_IMAGE_URL,
  );
  const [overlayImageUrl, setOverlayImageUrl] = useState(
    EXAMPLE_OVERLAY_IMAGE_URL,
  );
  const [x, setX] = useState(30);
  const [y, setY] = useState(9);
  const [w, setW] = useState(123);
  const [h, setH] = useState(256);
  const [boxX, setBoxX] = useState(34);
  const [boxY, setBoxY] = useState(12);
  const [boxW, setBoxW] = useState(53);
  const [boxH, setBoxH] = useState(57);
  const [boxRoundness, setBoxRoundness] = useState(20); // in percentage
  const [overlayRoundness, setOverlayRoundness] = useState(10); // in percentage
  const [isCropped, setIsCropped] = useState(true);
  const [resultImage, setResultImage] = useState(null);

  const config = {
    x,
    y,
    w,
    h,
    box_x: boxX,
    box_y: boxY,
    box_w: boxW,
    box_h: boxH,
    box_roundness: boxRoundness,
    overlay_roundness: overlayRoundness,
    is_cropped: isCropped,
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(JSON.stringify(config, null, 2))
      .then(() => alert("Configuration copied to clipboard!"))
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const handleSubmit = async () => {
    if (!productImageUrl || !overlayImageUrl) {
      return;
    }

    const response = await fetch("/api/overlay-image-internal", {
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
        box_roundness: boxRoundness,
        overlay_roundness: overlayRoundness,
        is_cropped: isCropped,
      }),
    });

    const data = await response.json();
    if (data.base64Image) {
      setResultImage(data.base64Image);
    } else {
      console.error(data.error);
    }
  };

  // for any changes to the parameters, submit the form

  return (
    <div className="p-6 font-sans">
      <h1 className="text-3xl mb-6 text-center">
        Image Overlay Tool with Transparency and Roundness
      </h1>

      <img
        src={"/test1.png"}
        alt="Product"
        className="max-w-full bg-[url(/test.png)] bg-center bg-[length:100px_100px] bg-no-repeat"
      />
      <img src={"/test.png"} alt="Product" className="max-w-full bg-red-500" />

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Image URL
          </label>
          <input
            type="text"
            value={productImageUrl}
            onChange={(e) => setProductImageUrl(e.target.value)}
            placeholder="Enter product image URL"
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Overlay Image URL
          </label>
          <input
            type="text"
            value={overlayImageUrl}
            onChange={(e) => setOverlayImageUrl(e.target.value)}
            placeholder="Enter overlay image URL"
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Position (X, Y)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
              className="w-1/2 p-2 border border-gray-300 rounded-md"
              placeholder="X"
              required
            />
            <input
              type="number"
              value={y}
              onChange={(e) => setY(Number(e.target.value))}
              className="w-1/2 p-2 border border-gray-300 rounded-md"
              placeholder="Y"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Overlay Width (w) & Height (h)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={w}
              onChange={(e) => setW(Number(e.target.value))}
              className="w-1/2 p-2 border border-gray-300 rounded-md"
              placeholder="Width"
              required
            />
            <input
              type="number"
              value={h}
              onChange={(e) => setH(Number(e.target.value))}
              className="w-1/2 p-2 border border-gray-300 rounded-md"
              placeholder="Height"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Box Region (x, y, w, h)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={boxX}
              onChange={(e) => setBoxX(Number(e.target.value))}
              className="w-1/2 p-2 border border-gray-300 rounded-md"
              placeholder="X"
              required
            />
            <input
              type="number"
              value={boxY}
              onChange={(e) => setBoxY(Number(e.target.value))}
              className="w-1/2 p-2 border border-gray-300 rounded-md"
              placeholder="Y"
              required
            />
          </div>
          <div className="flex space-x-2">
            <input
              type="number"
              value={boxW}
              onChange={(e) => setBoxW(Number(e.target.value))}
              className="w-1/2 p-2 border border-gray-300 rounded-md"
              placeholder="Width"
              required
            />
            <input
              type="number"
              value={boxH}
              onChange={(e) => setBoxH(Number(e.target.value))}
              className="w-1/2 p-2 border border-gray-300 rounded-md"
              placeholder="Height"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Box Roundness (%)
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={boxRoundness}
            onChange={(e) => setBoxRoundness(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {`Overlay Roundness  ${overlayRoundness}(%)`}
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={overlayRoundness}
            onChange={(e) => setOverlayRoundness(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isCropped}
            onChange={() => setIsCropped(!isCropped)}
            className="mr-2"
          />
          <label>Crop the overlay image</label>
        </div>

        <div className="mt-6 text-center">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md"
            onClick={handleSubmit}
          >
            Generate Image
          </button>
        </div>
      </div>

      {resultImage && (
        <div className="mt-6 text-center">
          <img
            src={resultImage}
            alt="Generated Mockup"
            className="max-w-full"
          />
        </div>
      )}

      <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Configuration</h2>
        <pre className="bg-gray-200 p-4 rounded-md text-sm overflow-x-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
        <button
          onClick={copyToClipboard}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
