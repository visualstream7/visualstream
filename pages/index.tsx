import { SignOutButton, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Home() {
  const { user } = useUser();

  return (
    <div className="flex flex-col items-center text-2xl ">
      <h1>Home page</h1>
      <div>
        <SignOutButton>
          <button className="flex bg-red-500 text-white p-2 ">
            <p>Sign Out</p>
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
