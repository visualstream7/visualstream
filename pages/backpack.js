import React, { useState } from "react";

const App = () => {
  const [imageURL, setImageURL] = useState("");
  const [points, setPoints] = useState([]);
  const [outputURL, setOutputURL] = useState(null);
  const [mode, setMode] = useState("add"); // Default mode is "add"

  const baseURL = "backpack.jpg";

  const handleAddPoint = (e) => {
    if (mode === "add") {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPoints((prevPoints) => [...prevPoints, { x, y }]);
    }
  };

  const generateOutput = () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    const baseImage = new Image();
    const overlayImage = new Image();

    baseImage.crossOrigin = "anonymous";
    overlayImage.crossOrigin = "anonymous";

    baseImage.src = baseURL;
    overlayImage.src = imageURL;

    baseImage.onload = () => {
      canvas.width = 700;
      canvas.height = 1000;

      context.drawImage(baseImage, 0, 0, 700, 1000);

      overlayImage.onload = () => {
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

        context.drawImage(overlayImage, 0, 0, 700, 1000);
        setOutputURL(canvas.toDataURL("image/png"));
      };

      overlayImage.onerror = () => {
        alert(
          "Failed to load the overlay image. Please ensure the URL is correct and supports cross-origin requests.",
        );
      };
    };

    baseImage.onerror = (e) => {
      console.log(e);
      alert(
        "Failed to load the base image. Please ensure the base image path is correct.",
      );
    };
  };

  return (
    <div className="App">
      <h1 className="text-3xl font-bold text-center">Image Editor</h1>
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`p-2 rounded ${mode === "add" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
          onClick={() => setMode("add")}
        >
          Add Mode
        </button>
      </div>

      <input
        type="text"
        placeholder="Enter image URL"
        value={imageURL}
        onChange={(e) => setImageURL(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-6"
      />

      <div
        className="relative w-[700px] h-[1000px] border border-gray-300"
        onClick={handleAddPoint}
      >
        <img src={baseURL} alt="Base" className="w-full h-full absolute" />
        {imageURL && (
          <img
            src={imageURL}
            alt="Overlay"
            className="w-full h-full absolute opacity-50" // Ensures the overlay fits well
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

      <button
        onClick={generateOutput}
        className="mt-6 p-2 bg-blue-500 text-white rounded"
      >
        Generate Output
      </button>

      {outputURL && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Final Output:</h2>
          <img src={outputURL} alt="Final Output" className="max-w-full" />
        </div>
      )}
    </div>
  );
};

export default App;
