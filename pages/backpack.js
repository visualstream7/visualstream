import React, { useState } from "react";

const Home = () => {
  const [baseImageUrl, setBaseImageUrl] = useState(
    "https://files.cdn.printful.com/products/279/9063_1534847488.jpg",
  );
  const [overlayImageUrl, setOverlayImageUrl] = useState(
    "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg",
  );
  const [points, setPoints] = useState([]);
  const [outputImage, setOutputImage] = useState(null);

  const handleAddPoint = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints((prevPoints) => [...prevPoints, { x, y }]);
  };

  const handleSubmit = async () => {
    const response = await fetch("/api/crop-backpack", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        baseImageUrl,
        overlayImageUrl,
        points,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      setOutputImage(URL.createObjectURL(blob));
    } else {
      alert("Failed to process image");
    }
  };

  return (
    <div className="App">
      <h1 className="text-3xl font-bold text-center">Image Editor</h1>
      <input
        type="text"
        placeholder="Enter base image URL"
        value={baseImageUrl}
        onChange={(e) => setBaseImageUrl(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-6"
      />
      <input
        type="text"
        placeholder="Enter overlay image URL"
        value={overlayImageUrl}
        onChange={(e) => setOverlayImageUrl(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-6"
      />
      <div
        className="relative w-[700px] h-[1000px] border border-gray-300"
        onClick={handleAddPoint}
      >
        {baseImageUrl && (
          <img
            src={baseImageUrl}
            alt="Base"
            className="w-full h-full absolute"
          />
        )}
        {overlayImageUrl && (
          <img
            src={overlayImageUrl}
            alt="Overlay"
            className="w-full h-full absolute opacity-50"
          />
        )}
        <svg className="absolute w-full h-full pointer-events-none">
          {points.length > 1 && (
            <polygon
              points={points.map((p) => `${p.x},${p.y}`).join(" ")}
              className="fill-red-500 fill-opacity-30 stroke-red-500 stroke-2 opacity-30"
            />
          )}
          {points.map((p, index) => (
            <circle key={index} cx={p.x} cy={p.y} r="5" fill="red" />
          ))}
        </svg>
      </div>
      {
        <div className="mt-6">
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(points, null, 2)}
          </pre>
        </div>
      }
      <button
        onClick={handleSubmit}
        className="mt-6 p-2 bg-blue-500 text-white rounded"
      >
        Generate Output
      </button>
      {outputImage && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Final Output:</h2>
          <img src={outputImage} alt="Final Output" className="max-w-full" />
        </div>
      )}
    </div>
  );
};

export default Home;
