import { FullPageSpinner } from "../spinners/fullPageSpiner";

interface Image {
  caption: string;
  description: string;
  summary: string;
  articleUrl: string;
  category: string;
  image_url: string;
}

export default function Grid({
  images,
  isImagesLoading,
}: {
  images: Image[];
  isImagesLoading: boolean;
}) {
  return (
    <div className="lg:flex-[0.8] max-h-[100%] overflow-y-scroll">
      {isImagesLoading ? <FullPageSpinner /> : null}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {!isImagesLoading &&
          images?.map((image) => (
            <div
              key={image.articleUrl}
              className="bg-red-500 h-[200px] overflow-clip"
            >
              <img
                src={image.image_url}
                alt={image.caption}
                className="min-h-[100%]"
              ></img>
            </div>
          ))}
      </div>
    </div>
  );
}
