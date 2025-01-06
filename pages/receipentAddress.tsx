import { useState } from "react";
import { BiLeftArrow, BiSolidLeftArrow } from "react-icons/bi";
import { FaArrowRightArrowLeft, FaGreaterThan } from "react-icons/fa6";
import { HiArrowRight } from "react-icons/hi";

export default function Checkout() {
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [country, setCountry] = useState("Bangladesh");
    const [addressLine1, setAddressLine1] = useState("");
    const [addressLine2, setAddressLine2] = useState("");
    const [city, setCity] = useState("");
    const [postalCode, setPostalCode] = useState("");

    const handleProceed = async () => {
        const checkoutData = {
            email,
            fullName,
            country,
            addressLine1,
            addressLine2,
            city,
            postalCode,
        };

        const response = await fetch("/api/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(checkoutData),
        });

        if (response.ok) {
            alert("Checkout successful!");
        } else {
            alert("Failed to proceed with checkout.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-lg bg-white p-6 rounded-md shadow">
                <button className="w-full bg-green-500 text-black text-lg py-2 rounded flex items-center justify-center hover:bg-green-600">
                    <span >Pay with</span>
                    <span className="flex items-center justify-center w-6 h-6 bg-black text-white rounded-full ml-2">
                        <FaGreaterThan size={14} />
                    </span>
                    <span className="font-semibold ml-2">Link</span>
                </button>

                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-2 text-gray-500 text-sm">Or pay with card</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Shipping information
                </h2>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700">Shipping address</label>
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
                            <option value="Bangladesh">Bangladesh</option>
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                        </select>
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
