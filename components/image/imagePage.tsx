import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";

import Nav from "@/components/nav";
import { IoArrowBack } from "react-icons/io5";

type UserPropType = {
  user: UserResource | null | undefined;
};

export default function ImagePage({ user }: UserPropType) {
  return (
    <div className="flex flex-col h-screen font-primary">
      <Nav user={user} />
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex justify-center items-center">
          <img
            src="/mockImages/7.jpg"
            alt="Big Display"
            className="max-w-full max-h-[60vh] object-contain"
          />
        </div>

        <div className="flex-1 p-6 lg:p-12 space-y-6 bg-white overflow-auto">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
            <IoArrowBack />
            <span>Back</span>
          </button>

          <h1 className="text-3xl lg:text-5xl font-bold text-gray-800">
            Warm Basket
          </h1>

          <div className="grid grid-cols-4 gap-y-4">
            {["tshirt.png", "shoes.png", "black tshirt.png", "phonecase.png", "shoes.png", "bag.png", "black tshirt.png", "bag.png"].map((imageName, idx) => (
              <div
                key={idx}
                className="w-40 h-40 bg-gray-100 rounded shadow overflow-hidden mx-auto"
              >
                <img
                  src={`/mockImages/${imageName}`}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>



          {/* Description */}
          <p className="text-gray-600 text-lg">
            Captivating abstractions and ethereal textures that balance chaos
            and serenity. Ideal for modern and contemporary interiors, created
            with advanced AI technology.
          </p>

          {/* Separator */}
          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-gray-800 font-semibold text-lg">$120</span>
          </div>

          {/* Price */}
          <p className="text-gray-800 font-bold text-2xl">$120</p>

          {/* Icons with Text */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="material-icons">local_shipping</span>
              <span>Ships from San Diego, California</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="material-icons">schedule</span>
              <span>Estimated to ship in 3-7 days within USA</span>
            </div>
          </div>

          {/* Search Button */}
          <button className="w-full bg-black text-white py-3 rounded shadow hover:bg-gray-800">
            SEARCH BY PRODUCT CATEGORY
          </button>
          <p>Taxes and shipping fees will apply upon checkout</p>
        </div>
      </div>
    </div>
  );
}
