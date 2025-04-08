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
import Link from "next/link";

type UserPropType = {
  user: UserResource | null | undefined;
};


interface Category {
  id: number;
  name: string;
  displayName?: string;  // or display_name if that's the field name in your DB
  priority?: number;
}

// export const CATEGORIES = {
//   ALL: "All",
//   AI: "AI",
//   ALPHABET: "ALPHABET",
//   ARCHITECTURE: "ARCHITECTURE",
//   ARTFUL: "ARTFUL",
//   FOOD: "FOOD",
//   KIDS: "KIDS",
//   MUSIC: "MUSIC",
//   SPORTS: "SPORTS",
//   TRAVEL: "TRAVEL",
//   YEARS: "YEARS",
// };

export default function SearchPage({ user }: UserPropType) {
  const router = useRouter();
  const { query } = router;

  const [selectedColors, setSelectedColors] = useState<Color[]>([]);
  const [isResizing, setIsResizing] = useState<number | null>(null);
  const [isNormalGrid, setIsNormalGrid] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const [showPalette, setShowPalette] = useState(false);

  const [likedImages, setLikedImages] = useState<number[]>([]);

  const { images, isImagesLoading } = useImageSearch({
    selectedColors: selectedColors,
    selectedCategory: selectedCategory,
    searchTags: searchTags,
    isResizing: isResizing,
  });


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
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        isResizing={isResizing}
        setIsResizing={setIsResizing}
        showPalette={showPalette}
        setShowPalette={setShowPalette}
        categories={categories}
      />

  
      <div className="flex gap-8 max-w-full overflow-x-auto p-4 no-scrollbar md:hidden bg-[#1C2A3C] text-white">
      
        <Link href="/?category=All">
          <div className="flex flex-col items-center cursor-pointer min-w-fit px-2">
            <span className="pb-2">All</span>
            <div
              className={`h-[3px] w-full rounded-full transition-all ${selectedCategory === 'All' ? "bg-white w-3/4" : "bg-transparent"
                }`}
            ></div>
          </div>
        </Link>

       
        {categories?.map((category: Category) => (
          <Link
            href={`/?category=${category.name}`}
            key={category.id}
          >
            <div className="flex flex-col items-center cursor-pointer min-w-fit px-2">
              <span className="pb-2 whitespace-nowrap">
                {category.displayName || category.name}
              </span>
              <div
                className={`h-[3px] w-full rounded-full transition-all ${category.name === selectedCategory
                    ? "bg-white w-3/4" 
                    : "bg-transparent"
                  }`}
              ></div>
            </div>
          </Link>
        ))}
      </div>

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
          showPalette={showPalette}
        />
      </div>
    </div>
  );
}
