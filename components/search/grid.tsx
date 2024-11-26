import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { FullPageSpinner } from "../spinners/fullPageSpiner";
import { FullContainerSpinner } from "../spinners/fullContainerSpinner";

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
            <div
              key={image.id}
              className="h-[200px] overflow-clip cursor-pointer"
            >
              <img
                src={image.image_url || ""}
                alt={image.caption || ""}
                className="min-h-[100%] hover:scale-[1.1] transition-transform duration-500 ease-in-out"
              ></img>
            </div>
          ))}
      </div>
    </div>
  );
}
