import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";

import Nav from "@/components/nav";
import Grid from "./grid";
import PickerContainer, { Color } from "./pickerContainer";
import useImageSearch from "@/hooks/useImageSearch";
import { useState } from "react";

type UserPropType = {
  user: UserResource | null | undefined;
};

export default function SearchPage({ user }: UserPropType) {
  const [selectedColors, setSelectedColors] = useState<Color[]>([]);
  const [isResizing, setIsResizing] = useState<number | null>(null);

  const { images, isImagesLoading } = useImageSearch({
    selectedColors: selectedColors,
    isResizing: isResizing,
  });

  return (
    <div className="flex flex-col h-dvh font-primary">
      <Nav user={user} />
      <div className="flex-1 flex flex-col-reverse lg:flex-row max-h-dvh overflow-hidden">
        <Grid images={images} isImagesLoading={isImagesLoading} />
        <PickerContainer
          selectedColors={selectedColors}
          setSelectedColors={setSelectedColors}
          isResizing={isResizing}
          setIsResizing={setIsResizing}
        />
      </div>
    </div>
  );
}
