import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";

import Nav from "@/components/nav";

type UserPropType = {
  user: UserResource | null | undefined;
};

export default function ImagePage({ user }: UserPropType) {
  return (
    <div className="flex flex-col h-dvh font-primary">
      <Nav user={user} />
      <div className="flex-1 flex flex-col-reverse lg:flex-row max-h-dvh overflow-hidden"></div>
    </div>
  );
}
