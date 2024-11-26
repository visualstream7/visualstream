import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { FullPageSpinner } from "../spinners/fullPageSpiner";
import { FullContainerSpinner } from "../spinners/fullContainerSpinner";
import { useState } from "react";
import { CircleDashed } from "lucide-react";

const SkeletonLoader = () => {
  return (
    <div
      role="status"
      className="space-y-8 md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center h-full"
    >
      <div className="flex items-center justify-center w-full h-full bg-gray-300 sm:w-96 dark:bg-gray-700">
        <CircleDashed
          className="text-accent animate-spin"
          strokeWidth={1}
          size={70}
        />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

const ImageComponent = ({ image }: { image: Image }) => {
  const [loading, setLoading] = useState(true);

  const handleImageLoad = () => {
    setLoading(false); // Hide loader when image is fully loaded
  };

  return (
    <div
      key={image.id}
      className="h-[200px] overflow-clip cursor-pointer relative"
    >
      {/* Show skeleton loader while the image is loading */}
      {loading && <SkeletonLoader />}
      <img
        src={image.image_url || ""}
        alt={image.caption || ""}
        className={`min-h-[100%] hover:scale-[1.1] transition-transform duration-500 ease-in-out ${loading ? "opacity-0" : "opacity-100"}`}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default function Grid({
  images,
  isImagesLoading,
}: {
  images: Image[];
  isImagesLoading: boolean;
}) {
  return (
    <div className="lg:flex-[0.8] max-h-[100%] overflow-y-auto bg-light custom-scrollbar">
      {isImagesLoading ? <FullContainerSpinner /> : null}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {!isImagesLoading &&
          images?.map((image) => (
            <ImageComponent key={image.id} image={image} />
          ))}
      </div>
    </div>
  );
}
