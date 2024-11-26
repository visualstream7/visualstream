import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";

import Nav from "@/components/nav";
import Grid from "./grid";
import PickerContainer from "./pickerContainer";
import useImageSearch from "@/hooks/useImageSearch";

type UserPropType = {
  user: UserResource | null | undefined;
};

export default function SearchPage({ user }: UserPropType) {
  const { images, isImagesLoading } = useImageSearch();

  return (
    <div className="flex flex-col h-dvh font-primary">
      <Nav user={user} />
      <div className="flex-1 flex flex-col-reverse lg:flex-row max-h-dvh overflow-hidden">
        <Grid images={images} isImagesLoading={isImagesLoading} />
        <PickerContainer />
      </div>
    </div>
  );
}
