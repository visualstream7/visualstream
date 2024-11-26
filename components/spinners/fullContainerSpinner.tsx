import { CircleDashed } from "lucide-react";

function FullContainerSpinner() {
  return (
    <div className="w-full lg:w-[70vw] absolute flex items-center justify-center h-[70%]">
      <CircleDashed
        className="text-accent animate-spin"
        strokeWidth={1}
        size={70}
      />
    </div>
  );
}

export { FullContainerSpinner };
