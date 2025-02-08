import { useState } from "react";
import { FullPageSpinner } from "@/components/spinners/fullPageSpiner";
import SearchPage from "@/components/search/searchPage";
import { useUser } from "@clerk/nextjs";
import VisualStream from "@/components/VisualStream";

export default function Home() {
  const { user, isLoaded } = useUser();
  const [showSearchPage, setShowSearchPage] = useState(false);

  if (!isLoaded) return <FullPageSpinner />;

  return (
    <div className="relative">
      <div className="hidden lg:block">
        <SearchPage user={user} />
      </div>

      <div className="lg:hidden">
        {!showSearchPage ? (
          <VisualStream onContinue={() => setShowSearchPage(true)} />
        ) : (
          <SearchPage user={user} />
        )}
      </div>
    </div>
  );
}
