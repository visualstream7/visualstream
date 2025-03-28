import React, { useState } from "react";
import { useRef } from "react";

const Home = () => {
  const svgRef = useRef(null);
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

  const getSVGPoints = (svgElement, interval = 30) => {
    const points = [];

    // Parse all <line> elements
    const line1 = svgElement.querySelectorAll("line")[0];
    const line2 = svgElement.querySelectorAll("line")[1];
    let path1 = svgElement.querySelectorAll("path")[0];
    let path2 = svgElement.querySelectorAll("path")[1];

    {
      let x1 = parseFloat(line1.getAttribute("x1"));
      let y1 = parseFloat(line1.getAttribute("y1"));
      let x2 = parseFloat(line1.getAttribute("x2"));
      let y2 = parseFloat(line1.getAttribute("y2"));

      let dx = x2 - x1;
      let dy = y2 - y1;
      let length = Math.sqrt(dx * dx + dy * dy);
      let steps = Math.ceil(length / interval);

      for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        points.push({ x: parseInt(x1 + dx * t), y: parseInt(y1 + dy * t) });
      }
    }

    {
      let pathLength = path2.getTotalLength();
      let steps = Math.ceil(pathLength / interval);

      for (let i = 0; i <= steps; i++) {
        const pt = path2.getPointAtLength((i / steps) * pathLength);
        points.push({ x: pt.x, y: pt.y });
      }
    }

    {
      let x1 = parseFloat(line2.getAttribute("x1"));
      let y1 = parseFloat(line2.getAttribute("y1"));
      let x2 = parseFloat(line2.getAttribute("x2"));
      let y2 = parseFloat(line2.getAttribute("y2"));

      let currentPoints = [];

      let dx = x2 - x1;
      let dy = y2 - y1;
      let length = Math.sqrt(dx * dx + dy * dy);
      let steps = Math.ceil(length / interval);

      for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        currentPoints.push({ x: x1 + dx * t, y: y1 + dy * t });
      }

      for (let i = currentPoints.length - 1; i >= 0; i--) {
        points.push({
          x: parseInt(currentPoints[i].x),
          y: parseInt(currentPoints[i].y),
        });
      }
    }

    {
      let pathLength = path1.getTotalLength();
      let steps = Math.ceil(pathLength / interval);

      for (let i = 0; i <= steps; i++) {
        const pt = path1.getPointAtLength((i / steps) * pathLength);
        points.push({ x: pt.x, y: pt.y });
      }
    }

    // for all points, make sure they are integers

    let newPoints = [];
    points.forEach((point) => {
      newPoints.push({
        x: parseInt(point.x),
        y: parseInt(point.y),
      });
    });

    newPoints = newPoints.filter((point, index, self) => {
      return (
        index === self.findIndex((t) => t.x === point.x && t.y === point.y)
      );
    });

    return newPoints;
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
            className="w-full h-full absolute border border-black"
          />
        )}
        {overlayImageUrl && (
          <img
            src={overlayImageUrl}
            alt="Overlay"
            className="w-full h-full absolute opacity-50"
          />
        )}
        {/* <svg className="absolute w-full h-full cursor-pointer" ref={svgRef}>
          <line
            x1="100"
            y1="100"
            x2="400"
            y2="100"
            stroke="red"
            strokeWidth="1"
          />
          <path
            d="M 100 100 Q 100 300 100 300"
            fill="none"
            stroke="blue"
            strokeWidth="1"
          />
          <line
            x1="100"
            y1="300"
            x2="400"
            y2="300"
            stroke="red"
            strokeWidth="1"
          />
          <path
            d="M 400 300 Q 100 100 400 400"
            fill="none"
            stroke="green"
            strokeWidth="1"
          />
        </svg> */}
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
        onClick={handleSubmit}
        className="mt-6 p-2 bg-blue-500 text-white rounded"
      >
        Generate Output
      </button>

      <button
        onClick={() => setPoints(getSVGPoints(svgRef.current))}
        className="mt-6 p-2 bg-red-500 text-white rounded"
      >
        Set SVG Points
      </button>

      {
        <div className="mt-6">
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(points, null, 2)}
          </pre>
        </div>
      }

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
