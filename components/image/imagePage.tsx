import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";

import Nav from "@/components/nav";
import { IoArrowBack } from "react-icons/io5";
import { BoxIcon, MouseIcon } from "lucide-react";

type UserPropType = {
  user: UserResource | null | undefined;
};

export default function ImagePage({ user }: UserPropType) {
  return (
    <div className="flex flex-col h-screen font-primary">
      <Nav user={user} />
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex justify-center mt-[100px]">
          <img
            src="/mockImages/7.jpg"
            alt="Big Display"
            className="max-w-full max-h-[60vh] rounded-lg object-contain"
          />
        </div>

        <div className="flex-1 p-6 lg:p-12 space-y-4 bg-white overflow-auto">
          <button className="flex items-center space-x-2 text-gray-800 hover:text-gray-800">
            <IoArrowBack />
            <span>Back</span>
          </button>

          <div>
            <h1 className="text-2xl lg:text-3xl  text-gray-900">
              Warm Basket
            </h1>
            <p>Yoshua Leisorek</p>
         </div>

          <div className="grid grid-cols-4 gap-4 w-[30vw]">
            {["tshirt.png", "shoes.png", "black tshirt.png", "phonecase.png", "shoes.png", "bag.png", "black tshirt.png", "bag.png"].map((imageName, idx) => (
              <div
                key={idx}
                className="w-full h-30 rounded shadow overflow-hidden border-black "
              >
                <img
                  src={`/mockImages/${imageName}`}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover "
                />
              </div>
            ))}
          </div>

          <p className="text-gray-600 text-left w-[28vw] pt-3 ">
            Captivating abstractions and ethereal textures that balance chaos
            and serenity. Ideal for modern and contemporary interiors, created
            with advanced AI technology .
          </p>

          <div className="flex justify-between items-center border-t pt-4">
            <p className="text-gray-800 font-bold text-2xl">$120</p>

          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-500">
              <MouseIcon />
              <span>Ships from San Diego, California</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <BoxIcon/>
              <span>Estimated to ship in 3-7 days within USA</span>
            </div>
          </div>

          <div className="flex flex-col pt-1">
            <button className="w-[30vw] bg-black text-white py-3 rounded shadow hover:bg-gray-900 mb-1">
              SEARCH BY PRODUCT CATEGORY
            </button>
            <p className="text-gray-500">Taxes and shipping fees will apply upon checkout</p>
          </div>
      
        </div>
      </div>
    </div>
  );
}
