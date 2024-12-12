import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";
import { useEffect, useState } from "react";
import { FiSearch, FiMenu } from "react-icons/fi"; // For icons
import { HiOutlineShoppingCart } from "react-icons/hi"; // Cart icon
import { BsChevronDown } from "react-icons/bs"; // Dropdown arrow icon
import { RiDropdownList } from "react-icons/ri";
import { MdArrowDropDown } from "react-icons/md";
import Link from "next/link";
import { SupabaseWrapper } from "@/database/supabase";

const database = new SupabaseWrapper("CLIENT");

type UserPropType = {
  user: UserResource | null | undefined;
};

type NavPropType = {
  user: UserResource | null | undefined;
  rerender?: boolean;
};

type ComponentPropType = {
  user: UserResource | null | undefined;
  count: number;
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
          <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
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
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => toggleContextMenu()}
              >
                Settings
              </li>
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
function MobileNav({ user }: ComponentPropType) {
  return (
    <div className="w-full block lg:hidden">
      <div className="bg-[#25384c] text-white py-2 px-4 flex items-center justify-between w-full">
        <div className="text-xl font-bold">VisualStream</div>
        <div className="flex items-center gap-4">
          <FiSearch size={24} />
          <FiMenu size={24} />
        </div>
      </div>
    </div>
  );
}

function LargeScreenNav({ user, count }: ComponentPropType) {
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
        <div className="text-xl font-bold">VisualStream</div>

        {/* SearchBar Section */}
        <div className="flex items-center bg-white text-black rounded-sm w-1/2">
          <div className="relative">
            <select className="bg-gray-200 text-black px-2 py-1 rounded-l-md appearance-none pr-8">
              <option>All</option>
            </select>
            <MdArrowDropDown
              size={20}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
          <input
            type="text"
            placeholder="Search VisualStream.ai"
            className="flex-grow px-2 py-2 outline-none"
          />
          <button className="px-3 text-gray-500">
            <FiSearch size={20} />
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
            <span className=" text-light opacity-[0.5g]">
              Returns <br />& Orders
            </span>
            {returnOrders}
            <MdArrowDropDown size={20} />
          </div>

          <div className="cursor-pointer flex items-center">
            <Link href="/cart" className="flex items-center gap-1">
              <HiOutlineShoppingCart size={24} />
              {count > 0 && (
                <span className="bg-danger text-white rounded-full px-1">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* LowerNavbar */}
      <div className="bg-[#1c2a3c] text-white py-2 px-4 flex items-center gap-6 w-full">
        <div className="flex items-center gap-1 cursor-pointer">
          <FiMenu size={20} />
          <span>All</span>
        </div>
        <div className="flex gap-8">
          <div className="cursor-pointer">LifeStyle & Gifts</div>
          <div className="cursor-pointer">Wall Decor</div>
          <div className="cursor-pointer">Tech Accessories</div>
          <div className="cursor-pointer">Fashion & Travel</div>
          <div className="cursor-pointer">Sports & Fitness</div>
          <div className="cursor-pointer">Outdoors</div>
          <div className="cursor-pointer">About Us</div>
          <div className="cursor-pointer">Contact Us</div>
        </div>
      </div>
    </div>
  );
}

// NavBar Component
export default function Nav({ user, rerender }: NavPropType) {
  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    const fetchCartCount = async () => {
      const { result: items, error: cartError } = await database.getCartItems(
        user!.id,
      );
      console.log("items", items, "cartError", cartError);

      if (items) {
        setCartCount(items.length);
      }
    };
    if (user) {
      fetchCartCount();
    }
  }, [user, rerender]);

  return (
    <>
      <LargeScreenNav user={user} count={cartCount} />
      <MobileNav user={user} count={cartCount} />
    </>
  );
}
