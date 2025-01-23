import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  UnitedStatesStates,
  CanadaStates,
  AustraliaStates,
} from "@/data/states";
import { useUser } from "@clerk/nextjs";
import useCart from "@/components/nav/useCart";
import { BiArrowBack } from "react-icons/bi";

let countries = {
  BD: { name: "Bangladesh", code: "BD" },
  US: { name: "United States", code: "US" },
  CA: { name: "Canada", code: "CA" },
  AU: { name: "Australia", code: "AU" },
};

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface ShippingProps {
  rerenderNav: boolean;
  setRerenderNav: React.Dispatch<React.SetStateAction<boolean>>;
  setShowShipping: React.Dispatch<React.SetStateAction<boolean>>;
}

const Shipping: React.FC<ShippingProps> = ({
  rerenderNav,
  setRerenderNav,
  setShowShipping,
}) => {
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState(countries.BD.code);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [state, setState] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState<number | null>(null);
  const [taxError, setTaxError] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [showProceedButton, setShowProceedButton] = useState(false);

  const { user } = useUser();

  const { cartItems } = useCart({
    rerender: rerenderNav,
    setRerenderNav: setRerenderNav,
    user,
  });

  useEffect(() => {
    setState(null);
    setShowProceedButton(false);
  }, [country]);

  const calculateShippingAndTax = async () => {
    if (!fullName || !addressLine1 || !city || !postalCode) {
      alert("Please fill all the fields");
      return;
    }

    const recipient = {
      address1: addressLine1,
      city: city,
      country_code: country,
      state_code: state,
      zip: postalCode,
    };

    const items = cartItems.map((item) => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
    }));

    try {
      // Calculate tax
      const taxResponse = await fetch("/api/get-tax-rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient }),
      });
      const taxData = await taxResponse.json();

      if (!taxData.result || taxData.error) {
        setTaxError(taxData.error || "Failed to calculate tax rate.");
        setTaxRate(null);
      } else {
        setTaxRate(taxData.result.rate);
        setTaxError(null);
      }

      // Calculate shipping
      const shippingResponse = await fetch("/api/get-shipping-rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient, items }),
      });
      const shippingData = await shippingResponse.json();

      if (!shippingData.result || shippingData.error) {
        setShippingError(
          shippingData.error || "Failed to calculate shipping cost.",
        );
        setShippingCost(null);
      } else {
        setShippingCost(shippingData.result);
        setShippingError(null);
      }

      // Show Proceed button if both calculations succeed
      if (taxData.result && shippingData.result) {
        setShowProceedButton(true);
      }
    } catch (error) {
      console.error("Error calculating tax or shipping:", error);
      setTaxError("Unexpected error occurred while calculating tax.");
      setShippingError("Unexpected error occurred while calculating shipping.");
    }
  };

  const handleProceed = async () => {
    if (!fullName || !addressLine1 || !city || !postalCode) {
      alert("Please fill all the fields");
      return;
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
        shippingAmount: shippingCost || 0,
        taxRate: taxRate || 0,
        recipient: {
          name: fullName,
          address1: addressLine1 || addressLine2,
          city,
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
    <div className="flex h-max w-full">
      <div className="w-full md:max-w-lg bg-white p-2 md:p-6 rounded-md">
        <BiArrowBack
          className="text-2xl cursor-pointer"
          onClick={() => setShowShipping(false)}
        />
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Shipping and Tax Information
        </h2>
        <form className="space-y-4">
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
              disabled
            >
              {Object.values(countries)
                .filter((country) => country.code === "US")
                .map((country) => (
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
                <option value="" disabled>
                  Select a state
                </option>
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
          {shippingCost !== null && taxRate !== null && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Shipping Cost: ${shippingCost.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Tax Rate: {taxRate}%</p>
            </div>
          )}
          {shippingError && (
            <p className="text-sm text-red-600">{shippingError}</p>
          )}
          {taxError && <p className="text-sm text-red-600">{taxError}</p>}

          {/* Calculate Shipping and Tax Button */}
          {!showProceedButton && (
            <button
              type="button"
              onClick={calculateShippingAndTax}
              className="w-full mt-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
            >
              Calculate Shipping
            </button>
          )}

          {showProceedButton && (
            <button
              type="button"
              onClick={handleProceed}
              className="w-full mt-4 py-2 bg-yellow-600 text-white font-bold rounded-md hover:bg-yellow-700"
            >
              Proceed to Payment
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Shipping;
