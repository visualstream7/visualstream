import { printfulClient } from "@/libs/printful-client";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Home() {
  const { user } = useUser();

  return (
    <div className="flex flex-col items-center text-2xl gap-8">
      <h1>Home page</h1>

      <button
        onClick={async () => {
          printfulClient.getProductsFromIds([71, 380]).then((res) => {
            console.log(res);
          });
        }}
        className="flex bg-blue-500 text-white p-2 "
      >
        <p>Get Products 71 and 380 </p>
      </button>

      {user ? (
        <SignOutButton>
          <button className="flex bg-red-500 text-white p-2 ">
            <p>Sign Out</p>
          </button>
        </SignOutButton>
      ) : (
        <SignInButton>
          <button className="flex bg-blue-500 text-white p-2 ">
            <p>Sign In</p>
          </button>
        </SignInButton>
      )}
    </div>
  );
}
