import React, { useState } from "react";
import { useRef } from "react";

let currentPoints = [
  {
    x: 135.19999998807907,
    y: 354.40000915527344,
  },
  {
    x: 145.19999998807907,
    y: 354.40000915527344,
  },
  {
    x: 154.19999998807907,
    y: 354.40000915527344,
  },
  {
    x: 166.19999998807907,
    y: 354.40000915527344,
  },
  {
    x: 176.19999998807907,
    y: 354.40000915527344,
  },
  {
    x: 186.19999998807907,
    y: 354.40000915527344,
  },
  {
    x: 186.19999998807907,
    y: 361.40000915527344,
  },
  {
    x: 186.19999998807907,
    y: 370.40000915527344,
  },
  {
    x: 186.19999998807907,
    y: 380.40000915527344,
  },
  {
    x: 186.19999998807907,
    y: 390.40000915527344,
  },
  {
    x: 185.19999998807907,
    y: 399.40000915527344,
  },
  {
    x: 185.19999998807907,
    y: 406.40000915527344,
  },
  {
    x: 186.19999998807907,
    y: 412.40000915527344,
  },
  {
    x: 191.19999998807907,
    y: 412.40000915527344,
  },
  {
    x: 199.19999998807907,
    y: 412.40000915527344,
  },
  {
    x: 205.19999998807907,
    y: 412.40000915527344,
  },
  {
    x: 209.19999998807907,
    y: 412.40000915527344,
  },
  {
    x: 216.19999998807907,
    y: 411.40000915527344,
  },
  {
    x: 219.19999998807907,
    y: 406.40000915527344,
  },
  {
    x: 219.19999998807907,
    y: 395.40000915527344,
  },
  {
    x: 219.19999998807907,
    y: 382.40000915527344,
  },
  {
    x: 219.19999998807907,
    y: 371.40000915527344,
  },
  {
    x: 219.19999998807907,
    y: 363.40000915527344,
  },
  {
    x: 218.19999998807907,
    y: 356.40000915527344,
  },
  {
    x: 222.19999998807907,
    y: 355.40000915527344,
  },
  {
    x: 227.19999998807907,
    y: 354.40000915527344,
  },
  {
    x: 234.19999998807907,
    y: 355.40000915527344,
  },
  {
    x: 252.19999998807907,
    y: 355.40000915527344,
  },
  {
    x: 285.19999998807907,
    y: 357.40000915527344,
  },
  {
    x: 311.19999998807907,
    y: 356.40000915527344,
  },
  {
    x: 340.19999998807907,
    y: 356.40000915527344,
  },
  {
    x: 367.19999998807907,
    y: 356.40000915527344,
  },
  {
    x: 389.19999998807907,
    y: 355.40000915527344,
  },
  {
    x: 408.19999998807907,
    y: 354.40000915527344,
  },
  {
    x: 423.19999998807907,
    y: 354.40000915527344,
  },
  {
    x: 437.19999998807907,
    y: 354.40000915527344,
  },
  {
    x: 451.19999998807907,
    y: 354.40000915527344,
  },
  {
    x: 461.19999998807907,
    y: 354.40000915527344,
  },
  {
    x: 474.19999998807907,
    y: 354.40000915527344,
  },
  {
    x: 474.19999998807907,
    y: 363.40000915527344,
  },
  {
    x: 475.19999998807907,
    y: 374.40000915527344,
  },
  {
    x: 475.19999998807907,
    y: 385.40000915527344,
  },
  {
    x: 475.19999998807907,
    y: 394.40000915527344,
  },
  {
    x: 474.19999998807907,
    y: 404.40000915527344,
  },
  {
    x: 475.19999998807907,
    y: 410.40000915527344,
  },
  {
    x: 477.19999998807907,
    y: 414.40000915527344,
  },
  {
    x: 483.19999998807907,
    y: 413.40000915527344,
  },
  {
    x: 488.19999998807907,
    y: 413.40000915527344,
  },
  {
    x: 496.19999998807907,
    y: 414.40000915527344,
  },
  {
    x: 501.19999998807907,
    y: 412.40000915527344,
  },
  {
    x: 506.19999998807907,
    y: 411.40000915527344,
  },
  {
    x: 508.19999998807907,
    y: 407.40000915527344,
  },
  {
    x: 507.19999998807907,
    y: 390.40000915527344,
  },
  {
    x: 506.19999998807907,
    y: 375.40000915527344,
  },
  {
    x: 505.19999998807907,
    y: 362.40000915527344,
  },
  {
    x: 505.19999998807907,
    y: 353.40000915527344,
  },
  {
    x: 510.19999998807907,
    y: 353.40000915527344,
  },
  {
    x: 526.1999999880791,
    y: 352.40000915527344,
  },
  {
    x: 537.1999999880791,
    y: 351.40000915527344,
  },
  {
    x: 547.1999999880791,
    y: 350.40000915527344,
  },
  {
    x: 556.1999999880791,
    y: 352.40000915527344,
  },
  {
    x: 562.1999999880791,
    y: 351.40000915527344,
  },
  {
    x: 568.1999999880791,
    y: 352.40000915527344,
  },
  {
    x: 571.1999999880791,
    y: 356.40000915527344,
  },
  {
    x: 570.1999999880791,
    y: 362.40000915527344,
  },
  {
    x: 568.1999999880791,
    y: 370.40000915527344,
  },
  {
    x: 568.1999999880791,
    y: 378.40000915527344,
  },
  {
    x: 567.1999999880791,
    y: 386.40000915527344,
  },
  {
    x: 567.1999999880791,
    y: 405.40000915527344,
  },
  {
    x: 565.1999999880791,
    y: 439.40000915527344,
  },
  {
    x: 563.1999999880791,
    y: 480.3999938964844,
  },
  {
    x: 562.1999999880791,
    y: 513.2000122070312,
  },
  {
    x: 560.1999999880791,
    y: 551.2000122070312,
  },
  {
    x: 557.1999999880791,
    y: 598.2000122070312,
  },
  {
    x: 557.1999999880791,
    y: 629.2000122070312,
  },
  {
    x: 555.1999999880791,
    y: 667.2000122070312,
  },
  {
    x: 555.1999999880791,
    y: 707.2000122070312,
  },
  {
    x: 553.1999999880791,
    y: 748.2000122070312,
  },
  {
    x: 552.1999999880791,
    y: 788.2000122070312,
  },
  {
    x: 552.1999999880791,
    y: 817.7999877929688,
  },
  {
    x: 551.1999999880791,
    y: 836.7999877929688,
  },
  {
    x: 551.1999999880791,
    y: 869.7999877929688,
  },
  {
    x: 551.1999999880791,
    y: 897.7999877929688,
  },
  {
    x: 552.1999999880791,
    y: 910.7999877929688,
  },
  {
    x: 552.1999999880791,
    y: 918.7999877929688,
  },
  {
    x: 551.1999999880791,
    y: 924.7999877929688,
  },
  {
    x: 549.1999999880791,
    y: 927.7999877929688,
  },
  {
    x: 545.1999999880791,
    y: 928.7999877929688,
  },
  {
    x: 537.1999999880791,
    y: 930.7999877929688,
  },
  {
    x: 519.1999999880791,
    y: 933.7999877929688,
  },
  {
    x: 496.19999998807907,
    y: 932.7999877929688,
  },
  {
    x: 471.19999998807907,
    y: 933.7999877929688,
  },
  {
    x: 459.19999998807907,
    y: 934.7999877929688,
  },
  {
    x: 438.19999998807907,
    y: 935.7999877929688,
  },
  {
    x: 425.19999998807907,
    y: 934.7999877929688,
  },
  {
    x: 411.19999998807907,
    y: 934.7999877929688,
  },
  {
    x: 399.19999998807907,
    y: 934.7999877929688,
  },
  {
    x: 389.19999998807907,
    y: 934.7999877929688,
  },
  {
    x: 377.19999998807907,
    y: 935.7999877929688,
  },
  {
    x: 364.19999998807907,
    y: 935.7999877929688,
  },
  {
    x: 354.19999998807907,
    y: 935.7999877929688,
  },
  {
    x: 337.19999998807907,
    y: 935.7999877929688,
  },
  {
    x: 318.19999998807907,
    y: 934.7999877929688,
  },
  {
    x: 295.19999998807907,
    y: 935.7999877929688,
  },
  {
    x: 277.19999998807907,
    y: 935.7999877929688,
  },
  {
    x: 261.19999998807907,
    y: 935.7999877929688,
  },
  {
    x: 247.19999998807907,
    y: 936.7999877929688,
  },
  {
    x: 236.19999998807907,
    y: 936.7999877929688,
  },
  {
    x: 225.19999998807907,
    y: 936.7999877929688,
  },
  {
    x: 210.19999998807907,
    y: 936.7999877929688,
  },
  {
    x: 201.19999998807907,
    y: 935.7999877929688,
  },
  {
    x: 193.19999998807907,
    y: 935.7999877929688,
  },
  {
    x: 185.19999998807907,
    y: 934.7999877929688,
  },
  {
    x: 175.19999998807907,
    y: 931.7999877929688,
  },
  {
    x: 166.19999998807907,
    y: 928.7999877929688,
  },
  {
    x: 157.19999998807907,
    y: 925.7999877929688,
  },
  {
    x: 149.19999998807907,
    y: 920.7999877929688,
  },
  {
    x: 144.19999998807907,
    y: 913.7999877929688,
  },
  {
    x: 144.19999998807907,
    y: 892.7999877929688,
  },
  {
    x: 144.19999998807907,
    y: 861.7999877929688,
  },
  {
    x: 143.19999998807907,
    y: 815.7999877929688,
  },
  {
    x: 141.19999998807907,
    y: 761.7999877929688,
  },
  {
    x: 138.19999998807907,
    y: 678.7999877929688,
  },
  {
    x: 139.19999998807907,
    y: 617.8000183105469,
  },
  {
    x: 134.19999998807907,
    y: 580.3999938964844,
  },
  {
    x: 135.19999998807907,
    y: 508.3999938964844,
  },
  {
    x: 133.19999998807907,
    y: 450.3999938964844,
  },
  {
    x: 131.19999998807907,
    y: 388.3999938964844,
  },
  {
    x: 131.19999998807907,
    y: 369.3999938964844,
  },
  {
    x: 130.19999998807907,
    y: 358.3999938964844,
  },
  {
    x: 130.19999998807907,
    y: 356.3999938964844,
  },
];
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
        <svg className="absolute w-full h-full cursor-pointer" ref={svgRef}>
          <line
            x1="233"
            y1="310"
            x2="233"
            y2="708"
            stroke="red"
            strokeWidth="1"
          />
          <path
            d="M 233 310 Q 415 400 597 310"
            fill="none"
            stroke="black"
            strokeWidth="1"
          />
          <line
            x1="597"
            y1="310"
            x2="593"
            y2="708"
            stroke="blue"
            strokeWidth="1"
          />
          <path
            d="M 233 708 Q 413 750 593 708"
            fill="none"
            stroke="green"
            strokeWidth="1"
          />
        </svg>
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
