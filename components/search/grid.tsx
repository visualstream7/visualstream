import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { FullPageSpinner } from "../spinners/fullPageSpiner";
import { FullContainerSpinner } from "../spinners/fullContainerSpinner";
import { useEffect, useRef, useState } from "react";
import { CircleDashed, XIcon } from "lucide-react";
import Link from "next/link";
import { ImageWithSimilarity } from "@/libs/ColorAnalyzer/colorAnalyzer";

const ImageComponent = ({ image }: { image: ImageWithSimilarity }) => {
  return (
    <div
      key={image.id}
      className="h-[200px] w-full relative overflow-hidden cursor-pointer"
    >
      {/* <p className="absolute z-40 font-bold bg-[#00000040] text-white bottom-0 text-center">{`similarity - ${image.similarity}`}</p> */}
      {/* Low-resolution image */}
      <img
        src={image.low_resolution_image_url || ""}
        alt={image.caption || ""}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300`}
      />
    </div>
  );
};

const NormalGrid = ({ images }: { images: ImageWithSimilarity[] }) => {
  return (
    <div className="w-[calc(100%-80px)] m-auto max-h-[calc(100%-80px)] h-[calc(100%-80px)] overflow-y-auto custom-scrollbar p-2">
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 auto-rows-[140px]">
        {images.map((image: ImageWithSimilarity) => (
          <div
            key={image.id}
            className="relative group overflow-hidden rounded-lg shadow-md"
          >
            <Link key={image.id} href={`/image/${image.id}`} className="h-full">
              <ImageComponent image={image} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function BentoGrid({ images }: { images: ImageWithSimilarity[] }) {
  // Split the images array into chunks of 7 elements

  let count = 48;
  const imageChunks = chunkArray(
    images,
    // images.filter((image) => image.similarity > 0.5),
    count,
  );

  function getColSpan(i: number) {
    if (i === 1) return "col-span-2";
    if (i === 5) return "col-span-2";
    if (i === 6) return "col-span-2";
    if (i === 15) return "col-span-2";
    if (i === 17) return "col-span-2";
    if (i === 23) return "col-span-2";
    if (i === 28) return "col-span-2";
    return "";
  }

  function getRowSpan(i: number) {
    if (i === 0) return "row-span-2";
    if (i === 2) return "row-span-2";
    if (i === 3) return "row-span-3";
    if (i === 5) return "row-span-2";
    if (i === 7) return "row-span-3";
    if (i === 10) return "row-span-2";
    if (i === 13) return "row-span-2";
    if (i === 19) return "row-span-2";
    if (i === 20) return "row-span-2";
    if (i === 23) return "row-span-2";
    if (i === 25) return "row-span-2";
    if (i === 28) return "row-span-2";
    return "";
  }

  const [selectedImage, setSelectedImage] =
    useState<ImageWithSimilarity | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  const [modalPosition, setModalPosition] = useState<"left" | "right" | null>(
    null,
  );

  function calculateModalPosition() {
    if (!selectedImageRef.current || !gridRef.current) return;

    const MODAL_WIDTH = 300; // Fixed modal width
    const { left: imageLeft, right: imageRight } =
      selectedImageRef.current.getBoundingClientRect();
    const { left: gridLeft, right: gridRight } =
      gridRef.current.getBoundingClientRect();

    const spaceOnLeft = imageLeft - gridLeft;
    const spaceOnRight = gridRight - imageRight;

    // Decide modal position based on available space
    if (spaceOnRight >= MODAL_WIDTH) {
      setModalPosition("right");
    } else if (spaceOnLeft >= MODAL_WIDTH) {
      setModalPosition("left");
    } else {
      setModalPosition(null); // Fallback if there's not enough space on either side
    }
  }

  useEffect(() => {
    if (selectedImage) {
      calculateModalPosition();
    } else {
      setModalPosition(null);
    }
  }, [selectedImage]);

  return (
    <div className="w-[calc(100%-80px)] m-auto max-h-[calc(100%-80px)] h-[calc(100%-80px)] overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col">
      {imageChunks.map((chunk, chunkIndex) => (
        <div
          key={chunkIndex}
          className="grid auto-rows-[70px] grid-cols-12 gap-1"
          ref={gridRef}
        >
          {chunk.map((image, i) => (
            <div
              key={image.id}
              className={`${getRowSpan(i)} rounded-xl ${getColSpan(i)} relative`}
            >
              <div className="w-full h-full relative">
                {selectedImage?.id === image.id && modalPosition && (
                  <div
                    className={`absolute flex flex-col gap-4 top-0 w-[300px] h-[max-content] bg-white z-20 p-4 shadow-md border border-black
                      transition-transform duration-300
                      ${
                        modalPosition === "left" && selectedImage
                          ? "left-0 -translate-x-[300px]"
                          : "right-0 translate-x-[300px]"
                      }`}
                  >
                    <XIcon
                      className="cursor-pointer ml-auto"
                      onClick={() => {
                        setSelectedImage(null);
                        selectedImageRef.current = null;
                      }}
                    />
                    <img
                      src={image.low_resolution_image_url!}
                      alt={image.ai_describe!}
                    />
                    <Link href={`/image/${image.id}`}>
                      <p className="text-blue-500 w-full text-center">
                        View Products
                      </p>
                    </Link>
                    {false && (
                      <div
                        className="w-10 h-10 rounded-full"
                        style={{
                          // @ts-ignore
                          backgroundColor: image.bestMatchColor,
                        }}
                      >
                        {/* @ts-ignore */}
                      </div>
                    )}
                    {false && <p> {image.similarity}</p>}
                    {false && image.color_composition && (
                      <div className="flex flex-col gap-4">
                        <h1 className="font-bold text-lg">Color Composition</h1>
                        <div className="flex items-end gap-2">
                          {/* @ts-ignore */}
                          {image.color_composition.map((palette, index) => (
                            <div
                              key={index}
                              className="flex flex-col items-center"
                            >
                              <div
                                className="w-10"
                                style={{
                                  height: `${palette.percentage * 2}px`,
                                  backgroundColor: palette.color,
                                  borderRadius: "4px",
                                }}
                              />
                              <p className="text-sm mt-1">
                                {parseFloat(palette.percentage).toFixed(2)}%
                              </p>
                              <div className="w-10 h-10 rounded-full border border-black">
                                <div
                                  className="w-full h-full rounded-full"
                                  style={{ backgroundColor: palette.color }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <img
                  src={image.image_url!}
                  alt={image.ai_describe!}
                  className={`w-full h-full object-cover`}
                  onClick={() => {
                    if (selectedImage) {
                      setSelectedImage(image);
                    } else {
                      setSelectedImage(image);
                    }
                  }}
                  ref={selectedImage?.id === image.id ? selectedImageRef : null}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Grid({
  images,
  isImagesLoading,
  normalGrid,
}: {
  images: ImageWithSimilarity[];
  isImagesLoading: boolean;
  normalGrid: boolean;
}) {
  return (
    <div className="flex flex-col w-full h-[100%] flex-[1]">
      {!normalGrid ? (
        <BentoGrid images={images} />
      ) : (
        <NormalGrid images={images} />
      )}
    </div>
  );
}
