import Nav from "@/components/nav";
import useCart from "@/components/nav/useCart";
import { Image } from "@/database/functions/images/getImagesFromDatabase";
import { SupabaseWrapper } from "@/database/supabase";
import { SignInButton, useSession, useUser } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
      className="h-[200px] w-full relative overflow-hidden cursor-pointer"
    >
      <img
        src={image.low_resolution_image_url || ""}
        alt={image.caption || ""}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300`}
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

  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Sign in to view your favourites</div>;

  return (
    <div>
      <Nav user={user} cartCount={cartItems.length} />
      {likedImages.map((image) => {
        return (
          <Link href={`/image/${image.id}`}>
            <ImageComponent
              key={image.id}
              image={image}
              likedImages={likedImages}
              setLikedImages={setLikedImages}
              user={user}
            />
          </Link>
        );
      })}
    </div>
  );
}
