import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { FullPageSpinner } from "../spinners/fullPageSpiner";
import { FullContainerSpinner } from "../spinners/fullContainerSpinner";
import { useState } from "react";
import { CircleDashed } from "lucide-react";
import Link from "next/link";
import { ImageWithSimilarity } from "@/libs/ColorAnalyzer/colorAnalyzer";

const ImageComponent = ({ image }: { image: ImageWithSimilarity }) => {
  const [loading, setLoading] = useState(true);

  const handleImageLoad = () => {
    setLoading(false); // Hide loader when the image is fully loaded
  };

  return (
    <div
      key={image.id}
      className="h-[200px] w-full relative overflow-hidden cursor-pointer"
    >
      <p className="absolute z-40 font-bold bg-[#00000040] text-white bottom-0 text-center">{`similarity - ${image.similarity}`}</p>
      {/* Low-resolution image */}
      <img
        src={image.low_resolution_image_url || ""}
        alt={image.caption || ""}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          loading ? "opacity-100" : "opacity-0 blur-0"
        }`}
      />

      {/* High-resolution image */}
      <img
        src={image.image_url || ""}
        alt={image.caption || ""}
        className={`absolute inset-0 w-full h-full object-cover duration-500 transition-all hover:scale-[1.1] ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={handleImageLoad}
      />
    </div>
  );
};
export default function Grid({
  images,
  isImagesLoading,
}: {
  images: ImageWithSimilarity[];
  isImagesLoading: boolean;
}) {
  return (
    <div className="lg:flex-[0.7] w-full max-h-[100%] overflow-y-auto bg-light custom-scrollbar">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 flex-1">
        {images?.map((image) => (
          <Link key={image.id} href={`/image/${image.id}`}>
            <ImageComponent key={image.id} image={image} />
          </Link>
        ))}
      </div>
    </div>
  );
}
