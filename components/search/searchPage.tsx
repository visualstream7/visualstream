import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";

import Nav from "@/components/nav";
import Grid from "./grid";
import PickerContainer, { Color } from "./pickerContainer";
import useImageSearch from "@/hooks/useImageSearch";
import { useEffect, useState } from "react";
import useCart from "../nav/useCart";
import { PaintBucketIcon } from "lucide-react";
import { XIcon } from "lucide-react"; // Make sure to import XIcon

type UserPropType = {
  user: UserResource | null | undefined;
};

export default function SearchPage({ user }: UserPropType) {
  const [selectedColors, setSelectedColors] = useState<Color[]>([]);
  const [isResizing, setIsResizing] = useState<number | null>(null);
  const [isNormalGrid, setIsNormalGrid] = useState<boolean>(true);

  const [gridType, setGridType] = useState<"normal" | "color" | "tag">(
    "normal",
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState<boolean>(false);

  const { images, isImagesLoading } = useImageSearch({
    selectedColors: selectedColors,
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

  return (
    <div className={`flex flex-col h-dvh font-primary`}>
      <Nav
        searchTags={searchTags}
        setSearchTags={setSearchTags}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        user={user}
        cartCount={cartItems.length}
      />
      {user && (
        <div className="flex justify-between items-center px-4 md:hidden">
          <div className="flex flex-col p-4 md:hidden">
            <p className="text-lg font-bold"> Welcome Back </p>
            <p> {user.fullName} </p>
          </div>
          {!showPicker ? (
            <PaintBucketIcon
              className="h-8 w-8"
              onClick={() => setShowPicker(true)}
            />
          ) : (
            <XIcon className="h-8 w-8" onClick={() => setShowPicker(false)} />
          )}
        </div>
      )}
      <div className="flex-1 flex flex-col lg:flex-row-reverse max-h-80vh overflow-hidden">
        <div className={`lg:block ${showPicker ? "block" : "hidden"} md:block`}>
          <PickerContainer
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            isResizing={isResizing}
            setIsResizing={setIsResizing}
            showPicker={showPicker}
            setShowPicker={setShowPicker}
          />
        </div>

        <Grid
          images={images}
          isImagesLoading={isImagesLoading}
          normalGrid={isNormalGrid}
          searchTags={searchTags}
          setSearchTags={setSearchTags}
        />
      </div>
    </div>
  );
}
