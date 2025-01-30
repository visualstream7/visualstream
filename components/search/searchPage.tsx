import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";

import Nav from "@/components/nav";
import Grid from "./grid";
import PickerContainer, { Color } from "./pickerContainer";
import useImageSearch from "@/hooks/useImageSearch";
import { useEffect, useState } from "react";
import useCart from "../nav/useCart";
import { SupabaseWrapper } from "@/database/supabase";
import { useRouter } from "next/router";

type UserPropType = {
  user: UserResource | null | undefined;
};

export const CATEGORIES = {
  ALL: "All",
  AI: "AI",
  ALPHABET: "ALPHABET",
  ARCHITECTURE: "ARCHITECTURE",
  ARTFUL: "ARTFUL",
  FOOD: "FOOD",
  KIDS: "KIDS",
  MUSIC: "MUSIC",
  SPORTS: "SPORTS",
  TRAVEL: "TRAVEL",
  YEARS: "YEARS",
};

export default function SearchPage({ user }: UserPropType) {
  const router = useRouter();
  const { query } = router;

  const [selectedColors, setSelectedColors] = useState<Color[]>([]);
  const [isResizing, setIsResizing] = useState<number | null>(null);
  const [isNormalGrid, setIsNormalGrid] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES.ALL,
  );

  const [likedImages, setLikedImages] = useState<number[]>([]);

  const { images, isImagesLoading } = useImageSearch({
    selectedColors: selectedColors,
    selectedCategory: selectedCategory,
    searchTags: searchTags,
    isResizing: isResizing,
  });

  useEffect(() => {
    console.log(selectedColors.length);
    if (selectedColors.length > 0) {
      setIsNormalGrid(false);
    } else {
      setIsNormalGrid(true);
    }
  }, [selectedColors]);

  const { cartItems } = useCart({
    user: user,
    rerender: false,
    setRerenderNav: () => {},
  });

  useEffect(() => {
    async function fetchLikedImages() {
      let supabase = new SupabaseWrapper("CLIENT");
      const { result, error } = await supabase.getLikedImages(user!.id);
      if (result && result.length > 0) {
        setLikedImages(result.map((image: any) => image.image_id));
      }
    }

    if (user) fetchLikedImages();
  }, [user]);

  // query params from router in useEffect (print)

  useEffect(() => {
    console.log(query);
    if (query.category) setSelectedCategory(query.category as string);
  }, [query]);

  return (
    <div className={`flex flex-col h-dvh font-primary`}>
      <Nav
        searchTags={searchTags}
        setSearchTags={setSearchTags}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        user={user}
        cartCount={cartItems.length}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <div className="flex-1 flex flex-col lg:flex-row-reverse max-h-80vh overflow-auto">
        <div className="lg:block md:block">
          <PickerContainer
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            isResizing={isResizing}
            setIsResizing={setIsResizing}
          />
        </div>

        <Grid
          images={images}
          isImagesLoading={isImagesLoading}
          normalGrid={isNormalGrid}
          searchTags={searchTags}
          setSearchTags={setSearchTags}
          likedImages={likedImages}
          setLikedImages={setLikedImages}
          user={user}
        />
      </div>
    </div>
  );
}
