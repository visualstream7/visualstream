import Nav from "@/components/nav";
import useCart from "@/components/nav/useCart";
import { FullPageSpinner } from "@/components/spinners/fullPageSpiner";
import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { SupabaseWrapper } from "@/database/supabase";
import { SignInButton, useSession, useUser } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  displayName?: string; // or display_name if that's the field name in your DB
  priority?: number;
}

const LikeButton = ({
  image,
  likedImages,
  setLikedImages,
  user,
}: {
  image: Image;
  likedImages: Image[];
  setLikedImages: React.Dispatch<React.SetStateAction<Image[]>>;
  user: UserResource | null | undefined;
}) => {
  const supabase = new SupabaseWrapper("CLIENT");
  const [isHovered, setIsHovered] = useState(false);

  let liked = likedImages.find((liked) => liked.id === image.id) ? true : false;
  return (
    <>
      {user ? (
        <Heart
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("user", user);
            console.log("Liked image", image.id);

            if (user) {
              if (liked) {
                setLikedImages(
                  likedImages.filter(
                    (likedImage) => likedImage.id !== image.id,
                  ),
                );
                supabase.unlikeImage(user.id, image.id);
              } else {
                setLikedImages([...likedImages, image]);
                supabase.likeImage(user.id, image.id);
              }
            }
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          fill={`${liked ? "#ff0000" : "#ffffff"}`}
          size={24}
          className={`absolute top-2 right-2 opacity-100 ${isHovered || liked ? "md:opacity-100" : "md:opacity-0"}`}
        />
      ) : (
        <SignInButton mode="modal">
          <Heart
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            fill={`${liked ? "#ff0000" : "#ffffff"}`}
            size={24}
            className={`absolute top-2 right-2 opacity-100 ${isHovered || liked ? "md:opacity-100" : "md:opacity-0"}`}
          />
        </SignInButton>
      )}
    </>
  );
};

const ImageComponent = ({
  image,
  likedImages,
  setLikedImages,
  user,
}: {
  image: Image;
  likedImages: Image[];
  setLikedImages: React.Dispatch<React.SetStateAction<Image[]>>;
  user: UserResource | null | undefined;
}) => {
  return (
    <div
      key={image.id}
      className="h-[200px] w-full relative overflow-hidden cursor-pointer group" // Add 'group' here
    >
      <img
        src={image.low_resolution_image_url || ""}
        alt={image.caption || ""}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
      />
      <LikeButton
        likedImages={likedImages}
        setLikedImages={setLikedImages}
        image={image}
        user={user}
      />
    </div>
  );
};

export default function Favourites() {
  const { user, isLoaded } = useUser();
  const [likedImages, setLikedImages] = useState<Image[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      let supabase = new SupabaseWrapper("CLIENT");
      const { result, error } = await supabase.getAutomateCategories();
      if (result) {
        const sortedCategories = (result as Category[])
          .slice()
          .sort((a, b) => (a.priority || 0) - (b.priority || 0));

        setCategories(sortedCategories);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchLikedImages() {
      let supabase = new SupabaseWrapper("CLIENT");
      const { result, error } = await supabase.getLikedImagesWithDetails(
        user!.id,
      );
      console.log(result, error);
      if (result && result.length > 0) {
        setLikedImages(result);
      }
    }
    if (user) fetchLikedImages();
  }, [user]);

  const { cartItems } = useCart({
    user: user,
    rerender: false,
    setRerenderNav: () => {},
  });

  if (!isLoaded) return <FullPageSpinner />;
  if (!user) return <div>Sign in to view your favorites</div>;

  return (
    <div className="max-h-dvh overflow-hidden bg-gray-50">
      <Nav user={user} cartCount={cartItems.length} categories={categories} />

      {/* Main Content Container */}
      <div className="container mx-auto py-10 px-4 ">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Your Favorites
        </h1>

        {/* Scrollable content below the title */}
        <div className="h-[70vh] md:h-[calc(80vh-4rem)] md:px-4 overflow-y-auto custom-scrollbar scroll-smooth">
          {likedImages.length === 0 ? (
            <div className="text-center text-gray-500">
              No favourite images yet. Start liking some!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-6 ">
              {likedImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-white shadow-md rounded-lg border border-gray-300 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link href={`/image/${image.id}`}>
                    <ImageComponent
                      image={image}
                      likedImages={likedImages}
                      setLikedImages={setLikedImages}
                      user={user}
                    />
                  </Link>
                  <div className="p-4">
                    <h2 className="text-lg font-medium text-gray-700 truncate">
                      {image.title || "Untitled"}
                    </h2>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
