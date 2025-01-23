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
  LucideLogOut,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react";
import { BiCart } from "react-icons/bi";
import { IoCart } from "react-icons/io5";
import { GrGoogle } from "react-icons/gr";
import { CiLogout } from "react-icons/ci";

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
};

type ComponentPropType = {
  user: UserResource | null | undefined;
  count: number;
  searchTags?: string[];
  setSearchTags?: React.Dispatch<React.SetStateAction<string[]>>;
  searchTerm?: string;
  setSearchTerm?: React.Dispatch<React.SetStateAction<string>>;
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

// MobileNavBar Component
function MobileNav({ user, count }: ComponentPropType) {
  return (
    <div className="w-full block lg:hidden fixed bottom-0 z-10 h-max bg-white">
      <div className="text-white px-2 py-4 flex items-center justify-around w-full">
        <Link href="/">
          <Home size={24} color="black" />
        </Link>
        <Heart size={24} color="black" />
        <Link href="/cart">
          <ShoppingCartIcon size={24} color="black" />
        </Link>

        {user ? (
          <SignOutButton>
            <LucideLogOut size={24} color="black" />
          </SignOutButton>
        ) : (
          <SignInButton mode="modal">
            <GrGoogle size={24} color="black" />
          </SignInButton>
        )}
      </div>
    </div>
  );
}

function LargeScreenNav({
  user,
  count,
  searchTags,
  setSearchTags,
  searchTerm,
  setSearchTerm,
}: ComponentPropType) {
  const [selectedCountry, setSelectedCountry] = useState("🇺🇸");
  const [returnOrders, setReturnOrders] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

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
          <div className="relative">
            <div
              className="cursor-pointer flex items-center gap-2"
              onClick={toggleCountryDropdown}
            >
              {selectedCountry}
              <MdArrowDropDown size={20} />
            </div>
            {showCountryDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-white text-black shadow-lg rounded-md w-20 z-10">
                <ul>
                  {["🇺🇸", "🇬🇧"].map((country) => (
                    <li
                      key={country}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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
          <div className="cursor-pointer">AI</div>
          <div className="cursor-pointer">ALPHABET</div>
          <div className="cursor-pointer">TARCHITECTURE</div>
          <div className="cursor-pointer">ARTFUL</div>
          <div className="cursor-pointer">FOOD</div>
          <div className="cursor-pointer">KIDS</div>
          <div className="cursor-pointer">MUSIC</div>
          <div className="cursor-pointer">SPORTS</div>
          <div className="cursor-pointer">TRAVEL</div>
          <div className="cursor-pointer">YEARS</div>
        </div>
      </div>
    </div>
  );
}

// NavBar Component
export default function Nav({
  user,
  cartCount,
  searchTags,
  setSearchTags,
  searchTerm,
  setSearchTerm,
}: NavPropType) {
  return (
    <>
      <LargeScreenNav
        user={user}
        count={cartCount}
        searchTags={searchTags}
        setSearchTags={setSearchTags}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <MobileNav user={user} count={cartCount} />
    </>
  );
}
