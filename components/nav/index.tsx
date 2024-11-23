import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";

type UserPropType = {
  user: UserResource | null | undefined;
};

import { useEffect, useRef, useState } from "react";

export const UserButton = ({ user }: UserPropType) => {
  const [showContextMenu, setShowContextMenu] = useState(false);

  // Ref for the user button and context menu
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleContextMenu = () => {
    setShowContextMenu((prev) => !prev);
  };

  // Close context menu if clicked outside of button or menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log("handleClickOutside", event.target, buttonRef.current);
      if (
        buttonRef.current &&
        menuRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (user) {
    return (
      <div className="relative" ref={buttonRef}>
        {/* User Profile and Avatar */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={toggleContextMenu}
        >
          <img
            src={user.imageUrl}
            alt="profile"
            className="w-8 h-8 rounded-full"
          />
        </div>

        {/* Context Menu: visible when the avatar is clicked */}
        {showContextMenu && (
          <div
            className="absolute top-full right-0 mt-2 w-max bg-white shadow-lg rounded-md z-10"
            ref={menuRef}
          >
            <ul className="text-dark font-medium text-center">
              <li className="px-4 pt-2">
                <p className="text-dark font-bold">{user.fullName}</p>
              </li>
              {user.emailAddresses && user.emailAddresses[0] && (
                <li className="px-4 p-2">
                  <p className="text-dark font-light break-all">
                    {user.emailAddresses[0].emailAddress}{" "}
                  </p>
                </li>
              )}
              {/* // line */}
              <li className="border-b border-gray-200"></li>

              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => toggleContextMenu()}
              >
                Go to Profile
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => toggleContextMenu()}
              >
                My Orders
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => toggleContextMenu()}
              >
                Settings
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <SignOutButton>
                  <button className="w-max text-danger font-bold">
                    Sign Out
                  </button>
                </SignOutButton>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Show CTA button (e.g., Sign In) when the user is not logged in
  return (
    <SignInButton mode="modal">
      <button className="flex bg-accent p-1 px-2 text-light font-bold rounded-md min-w-[80px] w-max items-center justify-center">
        Sign In
      </button>
    </SignInButton>
  );
};

export default function Nav({ user }: UserPropType) {
  return (
    <div className="bg-black">
      <UserButton user={user} />
    </div>
  );
}
