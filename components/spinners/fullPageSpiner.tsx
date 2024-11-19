import { CircleDashed } from "lucide-react";


function FullPageSpinner() {
  return (
    <div className="h-dvh w-full relative flex items-center justify-center">
      <CircleDashed
        className="text-[#1b1b1b50] animate-spin"
        strokeWidth={1}
        size={70}
      />
    </div>
  );
}

export { FullPageSpinner };
