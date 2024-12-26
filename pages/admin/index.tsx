import { SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function admin() {
  const { user, isLoaded } = useUser();

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    function checkAdmin() {
      let list_of_admin_emails = ["mdmarufbinsalim@gmail.com", "jeesan@1.com"];

      let userEmail = user?.emailAddresses[0].emailAddress;

      if (userEmail && list_of_admin_emails.includes(userEmail)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [user]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <SignInButton mode="modal">
        <button className="flex bg-accent p-1 px-2 text-light font-bold rounded-md min-w-[80px] w-max items-center justify-center">
          Sign In
        </button>
      </SignInButton>
    );
  }

  if (user && !isAdmin) {
    return <div>Unauthorized</div>;
  }

  return (
    <div>
      <h1>Admin</h1>
    </div>
  );
}
