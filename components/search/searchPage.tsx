import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";

import Nav from "@/components/nav";

type UserPropType = {
  user: UserResource | null | undefined;
};

export default function SearchPage({ user }: UserPropType) {
  return (
    <div className="flex flex-col h-dvh gap-4 font-primary">
      <Nav user={user} />
      <div className="flex justify-end text-dark gap-4">
        {/* Use the UserButton component here */}
      </div>
    </div>
  );
}
