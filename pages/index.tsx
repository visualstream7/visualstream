import { FullPageSpinner } from "@/components/spinners/fullPageSpiner";
import SearchPage from "@/features/search/searchPage";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <FullPageSpinner />;

  return <SearchPage user={user} />;
}
