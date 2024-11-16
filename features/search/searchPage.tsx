import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";

export default function SearchPage({
  user,
}: {
  user: UserResource | null | undefined;
}) {
  return (
    <div className="flex flex-col h-dvh gap-4 p-4 font-primary">
      {user ? (
        <div className="flex justify-end text-dark gap-4">
          <div className="flex items-center gap-2">
            <img
              src={user.imageUrl}
              alt="profile"
              className="w-8 h-8 rounded-full"
            />
            <p className="text-mid font-bold">{user.fullName}</p>
          </div>
          <SignOutButton>
            <button className="flex bg-danger p-1 px-2 text-light font-bold rounded-md min-w-[80px] items-center justify-center">
              <p>Sign Out</p>
            </button>
          </SignOutButton>
        </div>
      ) : (
        <SignInButton mode="modal">
          <button className="mk-auto flex bg-accent p-1 px-2 text-light font-bold rounded-md min-w-[80px] w-max items-center justify-center">
            Sign In
          </button>
        </SignInButton>
      )}
    </div>
  );
}
