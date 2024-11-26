import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { FullPageSpinner } from "../spinners/fullPageSpiner";
import { FullContainerSpinner } from "../spinners/fullContainerSpinner";
import { useState } from "react";

const SkeletonLoader = () => {
  return (
    <div
      role="status"
      className="space-y-8 md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center h-full"
    >
      <div className="flex items-center justify-center w-full h-full bg-gray-300 sm:w-96 dark:bg-gray-700">
        <svg
          className="w-10 h-10 text-gray-200 dark:text-gray-600 animate-bounce"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 18"
        >
          <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
        </svg>
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
