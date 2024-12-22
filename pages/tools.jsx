import React, { useEffect, useState } from "react";
import PickerContainer from "../components/search/pickerContainer";
const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

const rgbToLab = (r, g, b) => {
  let X, Y, Z;
  const [xr, yr, zr] = [0.964221, 1.0, 0.825211]; // reference white D50

  const transform = (c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  // Convert RGB to linear RGB
  r = transform(r / 255);
  g = transform(g / 255);
  b = transform(b / 255);

  // Linear RGB to XYZ
  X = r * 0.436052025 + g * 0.385081593 + b * 0.143087414;
  Y = r * 0.222491598 + g * 0.71688606 + b * 0.060621486;
  Z = r * 0.013929122 + g * 0.097097002 + b * 0.71418547;

  const labTransform = (t) =>
    t > 216 / 24389 ? Math.pow(t, 1 / 3) : ((24389 / 27) * t + 16) / 116;

  // Normalize to Lab
  const L = 116 * labTransform(Y / yr) - 16;
  const A = 500 * (labTransform(X / xr) - labTransform(Y / yr));
  const B = 200 * (labTransform(Y / yr) - labTransform(Z / zr));

  return [L, A, B];
};

// function to calculate the color similarity
function calculateColorSimilarity(color1, color2) {
  // color1 and color2 are hex strings
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const lab1 = rgbToLab(...rgb1);
  const lab2 = rgbToLab(...rgb2);

  const deltaE = Math.sqrt(
    Math.pow(lab2[0] - lab1[0], 2) +
      Math.pow(lab2[1] - lab1[1], 2) +
      Math.pow(lab2[2] - lab1[2], 2),
  );

  // normalize the similarity
  // max similarity is 119.84
  // 0 means the colors are identical
  const MAX_similarity = 119.84;
  let normalizedsimilarity = Math.min(1, deltaE / MAX_similarity);
  normalizedsimilarity = 1 - normalizedsimilarity;
  normalizedsimilarity = Math.round(normalizedsimilarity * 100);

  return normalizedsimilarity;
}

function calculatePercentageSimilarity(expectedPercentage, currentPercentage) {
  let lowerPercentage =
    expectedPercentage > currentPercentage
      ? currentPercentage
      : expectedPercentage;

  let higherPercentage =
    expectedPercentage > currentPercentage
      ? expectedPercentage
      : currentPercentage;

  let percentageSimilarity = (lowerPercentage / higherPercentage) * 100;

  return percentageSimilarity.toFixed(4);
}

function calculateTotalSimilarity(
  colorSimilarity,
  percentageSimilarity,
  colorWeight = 0.8,
  percentageWeight = 0.2,
) {
  // Ensure weights sum up to 1
  const totalWeight = colorWeight + percentageWeight;
  colorWeight /= totalWeight;
  percentageWeight /= totalWeight;

  // Calculate total similarity
  const totalSimilarity =
    colorSimilarity * colorWeight + percentageSimilarity * percentageWeight;
  return totalSimilarity;
}

function overallSimilarity(selectedColors, colorComposition) {
  let totalSimilarity = 0;

  // Iterate over each selected color
  for (let i = 0; i < selectedColors.length; i++) {
    const selectedColor = selectedColors[i];
    let maxSimilarity = 0;
    let maxPalettePercentage = 0;

    // Iterate over each palette in the color composition
    for (let j = 0; j < colorComposition.length; j++) {
      const palette = colorComposition[j];

      // Calculate individual similarity metrics
      const colorSimilarity = calculateColorSimilarity(
        palette.color,
        selectedColor.hex,
      );

      const percentageSimilarity = calculatePercentageSimilarity(
        palette.percentage,
        selectedColor.percentage,
      );

      const totalSimilarityValue = calculateTotalSimilarity(
        colorSimilarity,
        percentageSimilarity,
      );

      // Track the maximum similarity for the current selected color
      if (totalSimilarityValue > maxSimilarity) {
        maxSimilarity = totalSimilarityValue;
        maxPalettePercentage = palette.percentage;
      }
    }
    totalSimilarity += (maxSimilarity * maxPalettePercentage) / 100;
  }
  return totalSimilarity;
}

const Colorsimilarity = () => {
  const [color1, setColor1] = useState("#ffffff");
  const [color2, setColor2] = useState("#000000");
  const [similarity, setSimilarity] = useState(0);

  const calculate = () => {
    setSimilarity(calculateColorSimilarity(color1, color2));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Color similarity Calculator</h1>
      <div className="flex items-center gap-4 mb-4">
        <div>
          <label htmlFor="color1" className="block mb-2 font-semibold">
            Color 1
          </label>
          <input
            type="color"
            id="color1"
            value={color1}
            onChange={(e) => setColor1(e.target.value)}
            className="w-16 h-16 border rounded-md"
          />
        </div>
        <div>
          <label htmlFor="color2" className="block mb-2 font-semibold">
            Color 2
          </label>
          <input
            type="color"
            id="color2"
            value={color2}
            onChange={(e) => setColor2(e.target.value)}
            className="w-16 h-16 border rounded-md"
          />
        </div>
      </div>
      <button
        onClick={calculate}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Calculate Similarity
      </button>
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Color similarity</h2>
        <p className="text-xl font-bold">{similarity}%</p>
      </div>
      <div className="flex gap-4 mt-6">
        <div
          className="w-16 h-16"
          style={{ backgroundColor: color1, borderRadius: "4px" }}
        ></div>
        <div
          className="w-16 h-16"
          style={{ backgroundColor: color2, borderRadius: "4px" }}
        ></div>
      </div>
    </div>
  );
};

function ColorComposition({ colorComposition }) {
  return (
    <>
      {colorComposition.length > 0 && (
        <div className="mt-6">
          <div className="flex items-end gap-2 h-32 border-t border-gray-200 pt-4 justify-evenly w-max">
            {colorComposition.map((palette, index) => (
              <div key={index} className="flex flex-col items-center h-full">
                <div
                  className="w-8 rounded-t-lg mt-auto"
                  style={{
                    height: `${palette.percentage}%`,
                    backgroundColor: `${palette.color}`,
                  }}
                ></div>
                <p className="text-xs mt-1">
                  {parseFloat(palette.percentage).toFixed(6)}%
                </p>
                <div
                  className={`h-4 w-4 rounded-full`}
                  style={{ backgroundColor: palette.color }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function ImageAnalyzer({
  imageUrl,
  setImageUrl,
  colorComposition,
  setColorComposition,
}) {
  const fetchColorComposition = () => {
    if (!imageUrl.trim()) return;

    fetch("/api/get-composition", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_url: imageUrl }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data && data.result && data.result.image_data)
          setColorComposition(
            data.result.image_data.sort((a, b) => b.percentage - a.percentage),
          );
      })
      .catch((err) => console.error("Error fetching composition:", err));
  };

  return (
    <div className="mx-auto mt-10 p-4 border rounded-lg shadow-lg bg-gray-50">
      <h1 className="text-2xl font-bold text-center mb-6">Image Analyzer</h1>

      {/* Input Field for Image URL */}
      <div className="mb-4">
        <label htmlFor="image-url" className="block text-sm font-medium mb-2">
          Enter Image URL:
        </label>
        <input
          id="image-url"
          type="text"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            setColorComposition([]);
          }}
          placeholder="https://example.com/image.jpg"
          className="w-full p-2 border rounded-lg shadow-sm focus:ring focus:outline-none"
        />
      </div>

      {/* Fetch Button */}
      <button
        onClick={fetchColorComposition}
        className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-600"
      >
        Analyze Image
      </button>

      {<img src={imageUrl} alt="Image" className="mt-4 w-[300px]" />}

      {colorComposition.length > 0 && (
        <ColorComposition colorComposition={colorComposition} />
      )}
    </div>
  );
}

function Main() {
  const [imageUrl, setImageUrl] = useState("");
  const [colorComposition, setColorComposition] = useState([]); // [{ color: string, percentage: number }]
  const [selectedColors, setSelectedColors] = useState([]); // [{ hex: string, percentage: number }]
  const [isResizing, setIsResizing] = useState(false);

  let totalSimilarity = overallSimilarity(selectedColors, colorComposition);

  const options = {
    image_analyzer: (
      <ImageAnalyzer
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        colorComposition={colorComposition}
        setColorComposition={setColorComposition}
      />
    ),
    pick_color: (
      <div className="p-4 w-[300px]">
        <PickerContainer
          selectedColors={selectedColors}
          setSelectedColors={setSelectedColors}
          isResizing={isResizing}
          setIsResizing={setIsResizing}
        />
      </div>
    ),
    color_composition: (
      <div>
        <h1 className="text-xl font-bold mb-4">Image Color Composition</h1>
        <ColorComposition colorComposition={colorComposition} />
        <h2 className="text-lg font-semibold mt-6">
          Selected Colors Composition
        </h2>
        <ColorComposition
          colorComposition={selectedColors
            .map((color) => ({
              color: color.hex,
              percentage: color.percentage,
            }))
            .sort((a, b) => b.percentage - a.percentage)}
        />
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">
            Color Similarity : {totalSimilarity.toFixed(4)}%
          </h2>

          {/* similarity score will be total percentage x percentage of the selected color */}

          {/* Iterate through selectedColors */}
          <div className="grid grid-cols-1 gap-6">
            {selectedColors.map((selectedColor, selectedIndex) => (
              <div
                key={selectedIndex}
                className="p-4 border rounded-lg shadow bg-gray-50"
              >
                <h3 className="text-md font-medium mb-4 flex items-center gap-4">
                  Selected Color:
                  <span
                    className="inline-block w-6 h-6 ml-2 rounded-full"
                    style={{ backgroundColor: selectedColor.hex }}
                  ></span>
                  ({selectedColor.hex})
                </h3>

                {/* Sort and Compare with all colors in colorComposition */}
                <div className="flex flex-wrap gap-4">
                  {[...colorComposition]
                    .map((palette) => ({
                      ...palette,
                      color_similarity: calculateColorSimilarity(
                        palette.color,
                        selectedColor.hex,
                      ),
                      percentage_similarity: calculatePercentageSimilarity(
                        palette.percentage,
                        selectedColor.percentage,
                      ),
                      similarity: calculateTotalSimilarity(
                        calculateColorSimilarity(
                          palette.color,
                          selectedColor.hex,
                        ),
                        calculatePercentageSimilarity(
                          palette.percentage,
                          selectedColor.percentage,
                        ),
                      ),
                    }))
                    .sort((a, b) => b.similarity - a.similarity)
                    .map((palette, paletteIndex) => (
                      <div
                        key={paletteIndex}
                        className="flex flex-col items-center justify-between p-2 w-60 border rounded-lg bg-white"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-12 h-12 rounded-full text-white text-center flex items-center justify-center"
                            style={{ backgroundColor: selectedColor.hex }}
                          >
                            S
                          </div>
                          <div
                            className="w-12 h-12 rounded-full text-white text-center flex items-center justify-center"
                            style={{ backgroundColor: palette.color }}
                          >
                            I
                          </div>
                        </div>
                        <p className="text-sm mt-2">{palette.color}</p>
                        <p
                          className={`mt-1 border border-gray-200 p-1 rounded-lg w-full
                          ${
                            palette.color_similarity < 20
                              ? "text-red-600"
                              : palette.color_similarity < 50
                                ? "text-yellow-600"
                                : "text-green-600"
                          }
                        `}
                        >
                          {" "}
                          Color Similarity:{" "}
                          {palette.color_similarity.toFixed(4)}%
                        </p>
                        <p
                          className={`mt-1 border border-gray-200 p-1 rounded-lg w-full
                          ${
                            palette.percentage_similarity < 20
                              ? "text-red-600"
                              : palette.percentage_similarity < 50
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          percentage similarity:{" "}
                          {/* similarity between the selected color percentage and the image color percentage */}
                          {palette.percentage_similarity}%
                        </p>

                        <p className="mt-1 border border-gray-200 p-1 rounded-lg">
                          {" "}
                          Percentage in Selected colors:{" "}
                          {selectedColor.percentage.toFixed(4)}%
                        </p>
                        <p className="mt-1 border border-gray-200 p-1 rounded-lg">
                          {" "}
                          Percentage in Image: {palette.percentage.toFixed(4)}%
                        </p>
                        <p
                          className={`mt-1 border border-gray-200 p-1 rounded-lg w-full
                          ${
                            palette.similarity < 20
                              ? "text-red-600"
                              : palette.similarity < 50
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          Total Similarity: {palette.similarity.toFixed(4)}%
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    color_similarity: <Colorsimilarity />,
  };

  const [selectedTool, setSelectedTool] = useState(Object.keys(options)[0]);

  return (
    <div className="mx-auto mt-10 p-4 border rounded-lg shadow-lg bg-gray-50">
      <h1 className="text-2xl font-bold text-center mb-6">Toolset</h1>

      {/* Dropdown for Tool Selection */}
      <div className="mb-4">
        <label htmlFor="tool-select" className="block text-sm font-medium mb-2">
          Select a Tool:
        </label>
        <select
          id="tool-select"
          value={selectedTool}
          onChange={(e) => setSelectedTool(e.target.value)}
          className="w-full p-2 border rounded-lg shadow-sm focus:ring focus:outline-none"
        >
          {Object.keys(options).map((key) => (
            <option key={key} value={key}>
              {key.replace(/_/g, " ")} {/* Replace underscores with spaces */}
            </option>
          ))}
        </select>
      </div>

      {/* Display Selected Tool */}
      <div className="p-4 border rounded-lg shadow bg-white">
        {options[selectedTool]}
      </div>
    </div>
  );
}

export default Main;
