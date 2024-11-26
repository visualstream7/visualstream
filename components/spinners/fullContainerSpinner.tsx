import { CircleDashed } from "lucide-react";

function FullContainerSpinner() {
  return (
    <div className="h-[100%] w-full relative flex items-center justify-center">
      <CircleDashed
        className="text-accent animate-spin"
        strokeWidth={1}
        size={70}
      />
    </div>
  );
}

export { FullContainerSpinner };
