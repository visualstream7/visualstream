import React, { useState } from "react";
import { useRef } from "react";

let currentPoints = [];
[
  {
    x: 233,
    y: 310,
  },
  {
    x: 233,
    y: 319,
  },
  {
    x: 233,
    y: 329,
  },
  {
    x: 233,
    y: 339,
  },
  {
    x: 233,
    y: 349,
  },
  {
    x: 233,
    y: 359,
  },
  {
    x: 233,
    y: 369,
  },
  {
    x: 233,
    y: 379,
  },
  {
    x: 233,
    y: 389,
  },
  {
    x: 233,
    y: 399,
  },
  {
    x: 233,
    y: 409,
  },
  {
    x: 233,
    y: 419,
  },
  {
    x: 233,
    y: 429,
  },
  {
    x: 233,
    y: 439,
  },
  {
    x: 233,
    y: 449,
  },
  {
    x: 233,
    y: 459,
  },
  {
    x: 233,
    y: 469,
  },
  {
    x: 233,
    y: 479,
  },
  {
    x: 233,
    y: 489,
  },
  {
    x: 233,
    y: 499,
  },
  {
    x: 233,
    y: 509,
  },
  {
    x: 233,
    y: 518,
  },
  {
    x: 233,
    y: 528,
  },
  {
    x: 233,
    y: 538,
  },
  {
    x: 233,
    y: 548,
  },
  {
    x: 233,
    y: 558,
  },
  {
    x: 233,
    y: 568,
  },
  {
    x: 233,
    y: 578,
  },
  {
    x: 233,
    y: 588,
  },
  {
    x: 233,
    y: 598,
  },
  {
    x: 233,
    y: 608,
  },
  {
    x: 233,
    y: 618,
  },
  {
    x: 233,
    y: 628,
  },
  {
    x: 233,
    y: 638,
  },
  {
    x: 233,
    y: 648,
  },
  {
    x: 233,
    y: 658,
  },
  {
    x: 233,
    y: 668,
  },
  {
    x: 233,
    y: 678,
  },
  {
    x: 233,
    y: 688,
  },
  {
    x: 233,
    y: 698,
  },
  {
    x: 233,
    y: 708,
  },
  {
    x: 242.5736846923828,
    y: 710.1732177734375,
  },
  {
    x: 252.17208862304688,
    y: 712.2344970703125,
  },
  {
    x: 261.7945556640625,
    y: 714.180419921875,
  },
  {
    x: 271.4397277832031,
    y: 716.0104370117188,
  },
  {
    x: 281.106201171875,
    y: 717.724365234375,
  },
  {
    x: 290.7930603027344,
    y: 719.3189086914062,
  },
  {
    x: 300.4984436035156,
    y: 720.796630859375,
  },
  {
    x: 310.2216796875,
    y: 722.152099609375,
  },
  {
    x: 319.9606628417969,
    y: 723.3890380859375,
  },
  {
    x: 329.71453857421875,
    y: 724.5029296875,
  },
  {
    x: 339.48138427734375,
    y: 725.4961547851562,
  },
  {
    x: 349.2600402832031,
    y: 726.3655395507812,
  },
  {
    x: 359.0487976074219,
    y: 727.1126708984375,
  },
  {
    x: 368.8462829589844,
    y: 727.7353515625,
  },
  {
    x: 378.65081787109375,
    y: 728.2344360351562,
  },
  {
    x: 388.4609069824219,
    y: 728.6087036132812,
  },
  {
    x: 398.27496337890625,
    y: 728.8585205078125,
  },
  {
    x: 408.0914001464844,
    y: 728.9833984375,
  },
  {
    x: 417.90863037109375,
    y: 728.9833984375,
  },
  {
    x: 427.7250671386719,
    y: 728.8585205078125,
  },
  {
    x: 437.53912353515625,
    y: 728.6087036132812,
  },
  {
    x: 447.3492126464844,
    y: 728.2344360351562,
  },
  {
    x: 457.15374755859375,
    y: 727.7353515625,
  },
  {
    x: 466.95123291015625,
    y: 727.1126708984375,
  },
  {
    x: 476.739990234375,
    y: 726.3655395507812,
  },
  {
    x: 486.5186767578125,
    y: 725.4961547851562,
  },
  {
    x: 496.2855529785156,
    y: 724.5029296875,
  },
  {
    x: 506.03936767578125,
    y: 723.3890380859375,
  },
  {
    x: 515.7783203125,
    y: 722.152099609375,
  },
  {
    x: 525.5015869140625,
    y: 720.796630859375,
  },
  {
    x: 535.2069702148438,
    y: 719.3189086914062,
  },
  {
    x: 544.8938598632812,
    y: 717.724365234375,
  },
  {
    x: 554.560302734375,
    y: 716.0104370117188,
  },
  {
    x: 564.2054443359375,
    y: 714.180419921875,
  },
  {
    x: 573.827880859375,
    y: 712.2344970703125,
  },
  {
    x: 583.42626953125,
    y: 710.1732177734375,
  },
  {
    x: 593,
    y: 708,
  },
  {
    x: 593,
    y: 698,
  },
  {
    x: 593,
    y: 688,
  },
  {
    x: 593,
    y: 678,
  },
  {
    x: 593,
    y: 668,
  },
  {
    x: 593,
    y: 658,
  },
  {
    x: 593,
    y: 648,
  },
  {
    x: 593,
    y: 638,
  },
  {
    x: 593,
    y: 628,
  },
  {
    x: 593,
    y: 618,
  },
  {
    x: 594,
    y: 608,
  },
  {
    x: 594,
    y: 598,
  },
  {
    x: 594,
    y: 588,
  },
  {
    x: 594,
    y: 578,
  },
  {
    x: 594,
    y: 568,
  },
  {
    x: 594,
    y: 558,
  },
  {
    x: 594,
    y: 548,
  },
  {
    x: 594,
    y: 538,
  },
  {
    x: 594,
    y: 528,
  },
  {
    x: 594,
    y: 518,
  },
  {
    x: 595,
    y: 509,
  },
  {
    x: 595,
    y: 499,
  },
  {
    x: 595,
    y: 489,
  },
  {
    x: 595,
    y: 479,
  },
  {
    x: 595,
    y: 469,
  },
  {
    x: 595,
    y: 459,
  },
  {
    x: 595,
    y: 449,
  },
  {
    x: 595,
    y: 439,
  },
  {
    x: 595,
    y: 429,
  },
  {
    x: 595,
    y: 419,
  },
  {
    x: 596,
    y: 409,
  },
  {
    x: 596,
    y: 399,
  },
  {
    x: 596,
    y: 389,
  },
  {
    x: 596,
    y: 379,
  },
  {
    x: 596,
    y: 369,
  },
  {
    x: 596,
    y: 359,
  },
  {
    x: 596,
    y: 349,
  },
  {
    x: 596,
    y: 339,
  },
  {
    x: 596,
    y: 329,
  },
  {
    x: 596,
    y: 319,
  },
  {
    x: 597,
    y: 310,
  },
  {
    x: 242.757568359375,
    y: 311.56439208984375,
  },
  {
    x: 252.528076171875,
    y: 313.0458068847656,
  },
  {
    x: 262.3111572265625,
    y: 314.4416809082031,
  },
  {
    x: 272.1059875488281,
    y: 315.7528381347656,
  },
  {
    x: 281.911865234375,
    y: 316.9784240722656,
  },
  {
    x: 291.7281188964844,
    y: 318.1177673339844,
  },
  {
    x: 301.553955078125,
    y: 319.1715393066406,
  },
  {
    x: 311.3887939453125,
    y: 320.1376953125,
  },
  {
    x: 321.2316589355469,
    y: 321.0182800292969,
  },
  {
    x: 331.0820617675781,
    y: 321.81005859375,
  },
  {
    x: 340.9389953613281,
    y: 322.5159912109375,
  },
  {
    x: 350.8018798828125,
    y: 323.13275146484375,
  },
  {
    x: 360.66986083984375,
    y: 323.6629638671875,
  },
  {
    x: 370.54217529296875,
    y: 324.1040954589844,
  },
  {
    x: 380.4179992675781,
    y: 324.45794677734375,
  },
  {
    x: 390.2966003417969,
    y: 324.7228698730469,
  },
  {
    x: 400.17718505859375,
    y: 324.89990234375,
  },
  {
    x: 410.0589599609375,
    y: 324.98822021484375,
  },
  {
    x: 419.9411315917969,
    y: 324.98822021484375,
  },
  {
    x: 429.8228759765625,
    y: 324.89990234375,
  },
  {
    x: 439.7034606933594,
    y: 324.7228698730469,
  },
  {
    x: 449.58209228515625,
    y: 324.45794677734375,
  },
  {
    x: 459.4579162597656,
    y: 324.1040954589844,
  },
  {
    x: 469.3302307128906,
    y: 323.6629638671875,
  },
  {
    x: 479.1981506347656,
    y: 323.13275146484375,
  },
  {
    x: 489.0610656738281,
    y: 322.5159912109375,
  },
  {
    x: 498.9179992675781,
    y: 321.81005859375,
  },
  {
    x: 508.7684020996094,
    y: 321.0182800292969,
  },
  {
    x: 518.6112670898438,
    y: 320.1376953125,
  },
  {
    x: 528.4461059570312,
    y: 319.1715393066406,
  },
  {
    x: 538.2719116210938,
    y: 318.1177673339844,
  },
  {
    x: 548.0881958007812,
    y: 316.9784240722656,
  },
  {
    x: 557.89404296875,
    y: 315.7528381347656,
  },
  {
    x: 567.6888427734375,
    y: 314.4416809082031,
  },
  {
    x: 577.4719848632812,
    y: 313.0458068847656,
  },
  {
    x: 587.242431640625,
    y: 311.5643615722656,
  },
];
const Home = () => {
  const svgRef = useRef(null);
  const [baseImageUrl, setBaseImageUrl] = useState(
    "https://files.cdn.printful.com/products/19/1320_1663762583.jpg",
  );
  const [overlayImageUrl, setOverlayImageUrl] = useState(
    "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg",
  );
  const [points, setPoints] = useState([...currentPoints]);
  const [outputImage, setOutputImage] = useState(null);

  const handleAddPoint = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let newPoints = [...points];
    newPoints.push({ x, y });
    setPoints(newPoints);
  };

  const getSVGPoints = (svgElement, interval = 1) => {
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
        // x: point.x,
        // y: point.y,
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
            x1="234"
            y1="310"
            x2="234"
            y2="710"
            stroke="red"
            strokeWidth="1"
          />
          <path
            d="M 234 310 Q 415 330 600 310"
            fill="none"
            stroke="black"
            strokeWidth="1"
          />
          <line
            x1="600"
            y1="310"
            x2="595"
            y2="710"
            stroke="blue"
            strokeWidth="1"
          />
          <path
            d="M 234 710 Q 415 750 598 710"
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
