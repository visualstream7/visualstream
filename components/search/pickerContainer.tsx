import { colors } from "@/data/colors";

export default function PickerContainer() {
  return (
    <div className="lg:flex-[0.2] bg-light">
      <div className="w-[90%] aspect-square m-auto relative grid grid-cols-16">
        <img
          src="/palette.png"
          alt="palette"
          className="w-full h-full absolute z-0"
        />
        {colors.map((color, index) => (
          <div
            key={index}
            className={`absolute cursor-pointer hover:border-2 hover:border-white`}
            onClick={() => console.log(index, color)}
            style={{
              zIndex: 20,
              width: "6.25%",
              height: "6.25%",
              left: `${(index % 16) * 6.25}%`,
              top: `${Math.floor(index / 16) * 6.25}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
