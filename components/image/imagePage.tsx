import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";

import Nav from "@/components/nav";
import { IoArrowBack } from "react-icons/io5";
import { BoxIcon, MouseIcon } from "lucide-react";
import Link from "next/link";
import { Image } from "@/database/functions/images/getImagesFromDatabase";

type UserPropType = {
  user: UserResource | null | undefined;
  image: Image;
};

export default function ImagePage({ user, image }: UserPropType) {
  return (
    <div className="flex flex-col lg:max-h-dvh lg:overflow-hidden font-primary">
      <Nav user={user} />
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col justify-center">
          <Link href="/">
            <button className="flex lg:hidden items-center space-x-2 text-gray-800 hover:text-gray-800 ml-[5vw] my-4">
              <IoArrowBack />
              <span>Back</span>
            </button>
          </Link>
          <img
            src={image.image_url || ""}
            alt="Image Display"
            className="w-[90vw] lg:w-[30vw] max-h-[60vh] rounded-lg  object-cover m-auto"
          />
        </div>

        <div className="flex-1 p-6 lg:p-12 space-y-4 bg-white h-full max-h-[80vh] lg:overflow-y-scroll">
          <Link href="/">
            <button className="hidden lg:flex items-center space-x-2 text-gray-800 hover:text-gray-800">
              <IoArrowBack />
              <span>Back</span>
            </button>
          </Link>

          <div>
            <h1 className="text-2xl lg:text-3xl  text-gray-900">
              {"Image Title"}
            </h1>
            {/* <p>Yoshua Leisorek</p> */}
          </div>

          <div className="lg:grid grid grid-cols-4 lg:grid-cols-4 gap-4 lg:w-[30vw]">
            {[
              "tshirt.png",
              "shoes.png",
              "black tshirt.png",
              "phonecase.png",
              "shoes.png",
              "bag.png",
              "black tshirt.png",
              "bag.png",
            ].map((imageName, idx) => (
              <Link href={`/product/${image.id}/${idx}`}>
                <div
                  key={idx}
                  className="w-full lg:h-30 rounded shadow overflow-hidden border-black "
                >
                  <img
                    src={`/mockImages/${imageName}`}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover "
                  />
                </div>
              </Link>
            ))}
          </div>

          <p className="text-gray-600 text-left lg:w-[28vw] pt-3 ">
            {image.summary}
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
              <BoxIcon />
              <span>Estimated to ship in 3-7 days within USA</span>
            </div>
          </div>

          <div className="flex flex-col py-2">
            <button className="lg:w-[30vw] bg-black text-white py-3 rounded shadow hover:bg-gray-900 mb-1">
              SEARCH BY PRODUCT CATEGORY
            </button>
            <p className="text-gray-500">
              Taxes and shipping fees will apply upon checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
