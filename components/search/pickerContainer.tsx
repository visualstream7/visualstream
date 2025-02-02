import { colors } from "@/data/colors";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { TbDots } from "react-icons/tb";

export interface Color {
  hex: string;
  percentage: number;
}

interface PickerContainerProps {
  selectedColors: Color[];
  setSelectedColors: (colors: Color[]) => void;
  isResizing: number | null;
  setIsResizing: (index: number | null) => void;
  // showPicker: boolean;
  // setShowPicker: (show: boolean) => void;
}

export default function PickerContainer({
  selectedColors,
  setSelectedColors,
  isResizing,
  setIsResizing,
  // showPicker,
  // setShowPicker,
}: PickerContainerProps) {
  const [hoveringSwatchIndex, setHoveringSwatchIndex] = useState<number | null>(
    null,
  );

  const handleMouseDown = (index: number) => {
    setIsResizing(index);
  };

  const handleMouseUp = () => {
    setIsResizing(null);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing === null) return;

    const container = document.getElementById("swatch-container");
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const deltaX = e.movementX;

    const updatedColors = [...selectedColors];
    const currentColor = updatedColors[isResizing];
    const nextColor = updatedColors[isResizing + 1];

    if (!currentColor || !nextColor) return;

    const deltaPercentage = (deltaX / containerWidth) * 100;

    const newCurrentPercentage = Math.max(
      currentColor.percentage + deltaPercentage,
      5,
    );
    const newNextPercentage = Math.max(
      nextColor.percentage - deltaPercentage,
      5,
    );

    if (
      newCurrentPercentage + newNextPercentage <=
      currentColor.percentage + nextColor.percentage
    ) {
      currentColor.percentage = newCurrentPercentage;
      nextColor.percentage = newNextPercentage;
      setSelectedColors(updatedColors);
    }
  };

  const addColor = (color: string) => {
    if (selectedColors.some((c) => c.hex === color)) {
      console.log("Color already selected.");
      return;
    }

    if (selectedColors.length < 5) {
      const initialPercentage = 100 / (selectedColors.length + 1);
      const updatedColors = selectedColors.map((c) => ({
        ...c,
        percentage:
          (c.percentage * selectedColors.length) / (selectedColors.length + 1),
      }));

      setSelectedColors([
        ...updatedColors,
        { hex: color, percentage: initialPercentage },
      ]);
    } else {
      console.log("Maximum number of colors reached.");
    }
  };

  const deleteColor = (index: number) => {
    const updatedColors = [...selectedColors];
    updatedColors.splice(index, 1);

    const totalPercentage = updatedColors.reduce(
      (sum, color) => sum + color.percentage,
      0,
    );
    const normalizationFactor = 100 / totalPercentage;

    const normalizedColors = updatedColors.map((color) => ({
      ...color,
      percentage: Math.max(color.percentage * normalizationFactor, 5),
    }));

    setSelectedColors(normalizedColors);
  };

  return (
    <div
      className={`
    flex-1 bg-white mx-auto p-4 md:p-8 w-full overflow-auto h-full

  `}
    >
      <div className="my-4">
        <h1 className="font-bold text-2xl">Step 1</h1>
        <p>Select up to 5 colors</p>
      </div>
      <div className="w-[100%] aspect-square m-auto relative grid grid-cols-16 border border-gray-300">
        <img
          src="/palette.png"
          alt="palette"
          className="w-full h-full absolute z-1"
        />
        {colors.map((color, index) => (
          <div
            key={index}
            className="absolute cursor-pointer hover:border-2 hover:border-white"
            onClick={() => addColor(color)}
            style={{
              zIndex: 20,
              width: "6.25%",
              height: "6.25%",
              left: `${(index % 16) * 6.25}%`,
              top: `${Math.floor(index / 16) * 6.25}%`,
            }}
          />
        ))}
      </div>

      <div className="my-4">
        <h1 className="font-bold text-2xl">Step 2</h1>
        <p>Slide dividers to adjust color composition</p>
      </div>

      {selectedColors.length > 0 && (
        <div
          id="swatch-container"
          className="mt-4 flex w-[100%] m-auto h-[100px] relative overflow-hidden rounded bg-slate-200 p-2 border border-slate-300"
          onMouseUp={handleMouseUp}
          onMouseMove={(e) => handleMouseMove(e.nativeEvent)}
        >
          {selectedColors.map((color, index) => (
            <div
              key={index}
              className="flex items-center h-full relative"
              style={{ width: `${color.percentage}%` }}
              onMouseEnter={() => setHoveringSwatchIndex(index)}
              onMouseLeave={() => setHoveringSwatchIndex(null)}
            >
              <div
                className="h-full w-full justify-center items-center overflow-x-hidden"
                style={{
                  backgroundColor: color.hex,
                }}
              >
                <div className="flex items-center justify-center w-min h-full max-w-[100%] overflow-clip flex-wrap mx-auto">
                  <button
                    className={`w-[30px] min-w-[30px] h-[30px] bg-[url(/delete.png)] bg-no-repeat bg-center bg-cover transition-all md:opacity-0 ${
                      hoveringSwatchIndex === index
                        ? "md:opacity-100"
                        : "md:opacity-0"
                    }`}
                    onClick={() => deleteColor(index)}
                  ></button>
                  <p className="text-white text-sm">
                    {color.percentage?.toFixed(0)}%
                  </p>
                  <button
                    className={`w-[30px] min-w-[30px] h-[30px] bg-[url(/refine.png)] bg-no-repeat bg-center bg-cover transition-all md:opacity-0 ${
                      hoveringSwatchIndex === index
                        ? "md:opacity-100"
                        : "md:opacity-0"
                    }

                    `}
                    onClick={() => {}}
                  ></button>
                </div>
              </div>
              {index < selectedColors.length - 1 && (
                <div
                  className="w-3 h-full bg-slate-200 cursor-ew-resize flex items-center justify-center"
                  onMouseDown={() => handleMouseDown(index)}
                >
                  <TbDots className="rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
