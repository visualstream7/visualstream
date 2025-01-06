import useCart from "@/components/nav/useCart";
import {
  AustraliaStates,
  CanadaStates,
  UnitedStatesStates,
} from "@/data/states";
import { Printful } from "@/libs/printful-client/printful-sdk";
import { useUser } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { BiLeftArrow, BiSolidLeftArrow } from "react-icons/bi";
import { FaArrowRightArrowLeft, FaGreaterThan } from "react-icons/fa6";
import { HiArrowRight } from "react-icons/hi";

let countries = {
  BD: {
    name: "Bangladesh",
    code: "BD",
  },
  US: {
    name: "United States",
    code: "US",
  },
  CA: {
    name: "Canada",
    code: "CA",
  },
  AU: {
    name: "Australia",
    code: "AU",
  },
};

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function Checkout() {
  // const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState(countries.BD.code);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  let [state, setState] = useState<string | null>(null);
  const [rerenderNav, setRerenderNav] = useState<boolean>(false);

  const { user } = useUser();

  const {
    cartItems,
    count,
    loading,
    handleIncrement,
    handleDecrement,
    removeItemFromCart,
  } = useCart({ rerender: rerenderNav, setRerenderNav: setRerenderNav, user });

  useEffect(() => {
    setState(null);
  }, [country]);

  const handleProceed = async () => {
    if (!fullName || !addressLine1 || !city || !postalCode) {
      alert("Please fill all the fields");
    }

    const checkoutData = {
      fullName,
      country,
      addressLine1,
      addressLine2,
      city,
      postalCode,
    };

    let items = cartItems.map((item) => ({
      name: item.title,
      image: item.mock,
      price: Number(item.price) + Number(item.price) * (item.margin / 100),
      quantity: item.quantity,
      product_id: item.product_id,
      variant_id: item.variant_id,
      image_id: item.image_id,
      size: item.size,
      original_image: item.image,
      color: item.color,
    }));

    let shippingItems = items.map((item) => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
    }));

    let recipient = {
      address1: addressLine1,
      city: city,
      country_code: country,
    };

    const shippingResponse = await fetch("/api/get-shipping-rate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient,
        items: shippingItems,
      }),
    });

    const shippingData = await shippingResponse.json();
    if (!shippingData.result || shippingData.error) {
      alert("Failed to calculate shipping rate.");
      return;
    }

    const stripe = await stripePromise;

    if (!stripe) {
      return;
    }

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cartItems: items,
        userId: user?.id || null,
        shippingAmount: shippingData.result,
        recipient: {
          name: fullName,
          address1: addressLine1 || addressLine2,
          city: city,
          state: state || null,
          country_code: country,
          zip: postalCode,
        },
        returnUrl: window.location.origin,
      }),
    });

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg bg-white p-6 rounded-md shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Shipping information
        </h2>
        {/* {JSON.stringify(UnitedStatesStates)}
        {JSON.stringify(AustraliaStates)}
        {JSON.stringify(CanadaStates)} */}
        <form className="space-y-4">
          {/* <div>
            <label className="block text-sm text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div> */}

          <div>
            <label className="block text-sm text-gray-700">
              Shipping address
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Full name"
              required
            />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {Object.values(countries).map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>

            {(country === countries.US.code ||
              country === countries.CA.code ||
              country === countries.AU.code) && (
              <select
                value={state || ""}
                onChange={(e) => setState(e.target.value)}
                className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {country === countries.US.code &&
                  UnitedStatesStates.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                {country === countries.CA.code &&
                  CanadaStates.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                {country === countries.AU.code &&
                  AustraliaStates.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
              </select>
            )}

            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Address line 1"
              required
            />
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Address line 2 (optional)"
            />
            <div className="flex gap-4 mt-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="City"
                required
              />
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Postal code"
                required
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleProceed}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Proceed to Checkout
          </button>
        </form>
      </div>
    </div>
  );
}
