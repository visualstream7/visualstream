import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";
import { useEffect, useState } from "react";
import { FiSearch, FiMenu } from "react-icons/fi"; // For icons
import { HiOutlineShoppingCart } from "react-icons/hi"; // Cart icon
import { BsChevronDown, BsGoogle } from "react-icons/bs"; // Dropdown arrow icon
import { RiDropdownList } from "react-icons/ri";
import { MdArrowDropDown } from "react-icons/md";
import Link from "next/link";
import { SupabaseWrapper } from "@/database/supabase";
import useCart from "./useCart";
import {
  CarrotIcon,
  Heart,
  Home,
  LogOut,
  LucideLogOut,
  ShoppingCart,
  ShoppingCartIcon,
  UserIcon,
  X,
  XIcon,
} from "lucide-react";
import { BiCart } from "react-icons/bi";
import { IoCart } from "react-icons/io5";
import { GrGoogle } from "react-icons/gr";
import { CiLogout } from "react-icons/ci";
import { CATEGORIES } from "../search/searchPage";
import { useRouter } from "next/router";

const database = new SupabaseWrapper("CLIENT");

type UserPropType = {
  user: UserResource | null | undefined;
};

type NavPropType = {
  user: UserResource | null | undefined;
  cartCount: number;
  searchTags?: string[];
  setSearchTags?: React.Dispatch<React.SetStateAction<string[]>>;
  searchTerm?: string;
  setSearchTerm?: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory?: string;
  setSelectedCategory?: React.Dispatch<React.SetStateAction<string>>;
};

type ComponentPropType = {
  user: UserResource | null | undefined;
  count: number;
  searchTags?: string[];
  setSearchTags?: React.Dispatch<React.SetStateAction<string[]>>;
  searchTerm?: string;
  setSearchTerm?: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory?: string;
  setSelectedCategory?: React.Dispatch<React.SetStateAction<string>>;
};

// UserButton Component
export const UserButton = ({ user }: UserPropType) => {
  const [showContextMenu, setShowContextMenu] = useState(false);

  const toggleContextMenu = () => {
    setShowContextMenu((prev) => !prev);
  };

  if (user) {
    return (
      <div className="relative">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={toggleContextMenu}
        >
          <img
            src={user.imageUrl}
            alt="profile"
            className="w-8 h-8 rounded-full"
          />
        </div>
        {showContextMenu && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-30">
            <ul className="text-dark font-medium text-center">
              <li className="px-4 pt-2">
                <p className="text-dark font-bold">{user.fullName}</p>
              </li>
              {user.emailAddresses && user.emailAddresses[0] && (
                <li className="px-4 p-2">
                  <p className="text-dark font-light break-all">
                    {user.emailAddresses[0].emailAddress}
                  </p>
                </li>
              )}
              <li className="border-b border-gray-200"></li>
              {/* <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => toggleContextMenu()}
              >
                Settings
              </li> */}
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <SignOutButton>
                  <button className="w-max text-danger font-bold">
                    Sign Out
                  </button>
                </SignOutButton>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <SignInButton mode="modal">
      <button className="flex bg-accent p-1 px-2 text-light font-bold rounded-md min-w-[80px] w-max items-center justify-center">
        Sign In
      </button>
    </SignInButton>
  );
};

export const MobileUserModal = ({ user }: UserPropType) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        <img
          src={user?.imageUrl || "/default-profile.png"}
          alt="profile"
          className="w-10 h-10 rounded-full border border-gray-300 shadow-sm"
        />
      </div>
      {isOpen && (
        <div className="fixed bg-black bg-opacity-50 w-[100vw] h-[100vh] top-0 flex justify-center items-center z-50">
          <div className="w-full h-full bg-white flex flex-col items-center relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 text-gray-600 hover:text-black"
            >
              <X size={32} />
            </button>

            <div className="mt-16 flex flex-col items-center">
              <img
                src={user?.imageUrl || "/default-profile.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full border border-gray-300 shadow-md"
              />
              <p className="text-xl text-black font-semibold mt-3">
                {user?.fullName || "Guest"}
              </p>
              {user?.emailAddresses?.[0] && (
                <p className="text-sm text-gray-500 mt-1">
                  {user.emailAddresses[0].emailAddress}
                </p>
              )}
            </div>

            <div className="mt-6 w-full max-w-sm">
              {user && (
                <Link href="/orders">
                  <div className="w-full py-4 text-lg text-gray-700 font-medium border-b border-gray-200 hover:bg-gray-100 cursor-pointer text-center">
                    Orders
                  </div>
                </Link>
              )}

              <Link href="/about">
                <div className="w-full py-4 text-lg text-gray-700 font-medium border-b border-gray-200 hover:bg-gray-100 cursor-pointer text-center">
                  About Us
                </div>
              </Link>

              <Link href="/contact">
                <div className="w-full py-4 text-lg text-gray-700 font-medium border-b border-gray-200 hover:bg-gray-100 cursor-pointer text-center">
                  Contact Us
                </div>
              </Link>
            </div>


            <div className="absolute bottom-6 w-full max-w-sm px-6">
              {user ? (
                <SignOutButton>
                  <button className="w-full bg-red-500 text-white py-3 text-lg font-bold rounded-lg shadow-md hover:bg-red-600 transition">
                    Sign Out
                  </button>
                </SignOutButton>
              ) : (
                <SignInButton mode="modal">
                  <button className="flex items-center gap-2 w-full bg-[#25384c] hover:bg-[#1d2d3f] transition text-white py-3 text-lg font-bold rounded-lg shadow-md  justify-center">
                    <GrGoogle size={22} />
                    Sign In with Google
                  </button>
                </SignInButton>
              )}
            </div>
        </div>
        </div>
      )}
    </>
  );
};

function MobileNav({ user, count }: ComponentPropType) {
  return (
    <>
      {/* Bottom Navbar */}
      <div className="w-full  block lg:hidden border-t-2 fixed bottom-0 z-10 h-max bg-white shadow-lg">
        <div className="text-white px-2 py-4 flex items-center justify-around w-full">
          <Link href="/">
            <Home size={24} color="black" />
          </Link>

          <Link href="/favorites">
            <Heart size={24} color="black" />
          </Link>

          {/* Cart Icon with Count Badge */}
          <div className="relative">
            <Link href="/cart">
              <ShoppingCart size={24} color="black" />
            </Link>
            {count > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </div>

          {/* User Profile Button (Opens Fullscreen Modal) */}
          <MobileUserModal user={user} />
        </div>
      </div>
    </>
  );
}

function LargeScreenNav({
  user,
  count,
  searchTags,
  setSearchTags,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
}: ComponentPropType) {
  const [selectedCountry, setSelectedCountry] = useState("🇺🇸");
  const [returnOrders, setReturnOrders] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const router = useRouter();

  const toggleCountryDropdown = () => {
    setShowCountryDropdown((prev) => !prev);
  };

  const selectCountry = (country: string) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };

  return (
    <div className="w-full hidden lg:block">
      {/* UpperNavbar */}
      <div className="bg-[#25384c] text-white py-2 px-4 flex items-center justify-between w-full">
        {/* Logo Section */}
        <Link href="/">
          <div className="text-xl font-bold">VisualStream</div>
        </Link>
        {/* SearchBar Section */}
        <div className="flex items-center bg-white text-black rounded-sm w-1/2">
          <div className="relative">
            {/* <select className="bg-gray-200 text-black px-2 py-1 rounded-l-md appearance-none pr-8">
              <option>All</option>
            </select> */}
            {/* <MdArrowDropDown
              size={20}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
            /> */}
          </div>
          <input
            type="text"
            placeholder="Search VisualStream.ai"
            className="flex-grow px-2 py-2 outline-none"
            onChange={(e) =>
              setSearchTerm ? setSearchTerm(e.target.value) : null
            }
            value={searchTerm || ""}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                if (!setSearchTags) return;
                if (!setSearchTerm) return;
                if (searchTerm && searchTags) {
                  if (searchTags.includes(searchTerm)) return;
                  if (searchTags.length >= 5) {
                    alert("You can only search for 5 tags at a time");
                    return;
                  }
                  setSearchTags([...searchTags, searchTerm]);
                  setSearchTerm("");
                }
              }
            }}
          />
          <button className="px-3 text-gray-500">
            <FiSearch
              size={20}
              onClick={() => {
                if (!setSearchTags) return;
                if (!setSearchTerm) return;
                if (searchTerm && searchTags) {
                  if (searchTags.includes(searchTerm)) return;

                  if (searchTags.length >= 5) {
                    alert("You can only search for 5 tags at a time");
                    return;
                  }

                  setSearchTags([...searchTags, searchTerm]);
                  setSearchTerm("");
                }
              }}
            />
          </button>
        </div>

        {/* Country Dropdown, Profile Icon, Orders, and Cart */}
        <div className="flex items-center gap-6 relative">
          <Link href="/favorites" className="flex items-center cursor-pointer">
            <Heart
              size={22}
              className="text-light opacity-80 hover:opacity-100 transition-opacity"
            />
          </Link>

          <div className="relative">
            <div
              className="cursor-pointer flex items-center gap-2"
              // onClick={toggleCountryDropdown}
            >
              {selectedCountry}
              {/* <MdArrowDropDown size={20} /> */}
            </div>
            {showCountryDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-white text-black shadow-lg rounded-md w-max z-10">
                <ul>
                  {["🇺🇸"].map((country) => (
                    <li
                      key={country}
                      className="px-2 py-2 hover:bg-gray-100 cursor-pointer rounded-md w-max"
                      onClick={() => selectCountry(country)}
                    >
                      {country}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* User Button */}
          <UserButton user={user} />

          {/* Orders and Cart */}
          <div className="cursor-pointer flex items-center gap-1">
            <Link href="/orders" className="flex items-center">
              <span className=" text-light opacity-[0.5g]">Orders</span>
            </Link>
            {returnOrders}
          </div>

          <div className="cursor-pointer relative">
            <Link href="/cart" className="flex items-center">
              <HiOutlineShoppingCart size={28} className="text-light" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs font-bold w-5 h-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* LowerNavbar */}
      <div className="bg-[#1c2a3c] text-white py-2 px-4 flex items-center gap-6 w-full">
        <div className="flex gap-8">
          {Object.keys(CATEGORIES).map((category, index) => (
            // @ts-ignore
            <Link href={`/?category=${CATEGORIES[category]}`} key={index}>
              <div
                className={`cursor-pointer ${
                  category === selectedCategory && "border-b-2 border-white"
                }`}
              >
                {category}
              </div>
            </Link>
          ))}
          <Link href="/about">
            {" "}
            <div className="cursor-pointer">About Us</div>
          </Link>
          <Link href="/contact">
            {" "}
            <div className="cursor-pointer">Contact Us</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// NavBar Component
// export default function Nav({
//   user,
//   cartCount,
//   searchTags,
//   setSearchTags,
//   searchTerm,
//   setSearchTerm,
// }: NavPropType) {
//   return (
//     <>
//       <LargeScreenNav
//         user={user}
//         count={cartCount}
//         searchTags={searchTags}
//         setSearchTags={setSearchTags}
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//       />
//       <MobileNav user={user} count={cartCount} />
//     </>
//   );
// }

export default function Nav({
  user,
  cartCount,
  searchTags,
  setSearchTags,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
}: NavPropType) {
  const router = useRouter();

  return (
    <>
      <div className="flex p-4 md:hidden justify-between items-center">
        <Link href="/">
          <div className="text-xl font-bold">VisualStream</div>
        </Link>
      </div>

      {router.pathname === "/" && (
        <div className="flex justify-between items-center px-4 md:hidden">
          {user && (
            <div className="flex flex-col py-4 md:hidden">
              <p className="text-lg font-bold"> Welcome Back </p>
              <p> {user.fullName} </p>
            </div>
          )}
        </div>
      )}

      {router.pathname === "/" && (
        <div className="block lg:hidden bg-white  text-black py-2 px-4 w-full">
          <div className="flex items-center bg-gray-100  border border-gray-300 focus:ring-2 focus:ring-gray-200 text-black rounded-md">
            <input
              type="text"
              placeholder="Search VisualStream.ai"
              className="flex-grow px-2 py-2 border border-gray-300 outline-none rounded-tl-md rounded-bl-md focus:ring-3 focus:ring-gray-200"
              onChange={(e) =>
                setSearchTerm ? setSearchTerm(e.target.value) : null
              }
              value={searchTerm || ""}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  if (!setSearchTags) return;
                  if (!setSearchTerm) return;
                  if (searchTerm && searchTags) {
                    if (searchTags.includes(searchTerm)) return;
                    if (searchTags.length >= 5) {
                      alert("You can only search for 5 tags at a time");
                      return;
                    }
                    setSearchTags([...searchTags, searchTerm]);
                    setSearchTerm("");
                  }
                }
              }}
            />
            <button className="px-3 text-gray-900">
              <FiSearch
                size={20}
                onClick={() => {
                  if (!setSearchTags) return;
                  if (!setSearchTerm) return;
                  if (searchTerm && searchTags) {
                    if (searchTags.includes(searchTerm)) return;

                    if (searchTags.length >= 5) {
                      alert("You can only search for 5 tags at a time");
                      return;
                    }

                    setSearchTags([...searchTags, searchTerm]);
                    setSearchTerm("");
                  }
                }}
              />
            </button>
          </div>
        </div>
      )}

      {router.pathname === "/" && searchTags && searchTags.length > 0 && (
        <div className="flex md:hidden items-center p-2 px-4 gap-4 overflow-x-scroll h-min max-w-[calc(90vw-80px)] no-scrollbar flex-wrap">
          {searchTags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-blue-300 rounded-full w-max px-2"
            >
              <p>{tag}</p>
              <button
                onClick={() => {
                  if (!setSearchTags) return;
                  setSearchTags(searchTags.filter((t) => t !== tag));
                }}
              >
                <XIcon size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Large Screen Nav */}
      <LargeScreenNav
        user={user}
        count={cartCount}
        searchTags={searchTags}
        setSearchTags={setSearchTags}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Mobile Nav */}
      <MobileNav user={user} count={cartCount} />
    </>
  );
}
