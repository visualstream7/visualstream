import Nav from "@/components/nav";
import useCart from "@/components/nav/useCart";
import { useUser } from "@clerk/nextjs";
import React from "react";

export default function AboutUs() {
    const { user, isLoaded } = useUser();
    const { cartItems } = useCart({
        user: user,
        rerender: false,
        setRerenderNav: () => {},
      });


    return (
        <div className="bg-gray-50">
            <Nav user={user} cartCount={cartItems.length} />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-[#1c2a36] via-[#25384c] to-[#40566b] text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold">
                        About Our Company
                    </h1>
                    <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
                        We strive to bring the best services to our customers with innovation, dedication, and excellence.
                    </p>
                </div>
            </section>


            {/* What We Do Section */}
            <section className="py-16 bg-gray-100">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                    {/* Right Side */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">
                            What We Do
                        </h2>
                        <p className="mt-4 text-gray-600 leading-relaxed">
                            From cutting-edge technology solutions to customer-focused services, we pride ourselves on delivering value and results to clients around the globe.
                        </p>
                    </div>
                </div>
            </section>

            {/* Highlights Section */}
            <section className="py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">
                        Our Highlights
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Highlight Items */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h3 className="text-xl font-bold text-blue-500">10+ Years</h3>
                            <p className="mt-2 text-gray-600">Experience in the industry.</p>
                        </div>
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h3 className="text-xl font-bold text-blue-500">500+</h3>
                            <p className="mt-2 text-gray-600">Happy clients worldwide.</p>
                        </div>
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h3 className="text-xl font-bold text-blue-500">24/7 Support</h3>
                            <p className="mt-2 text-gray-600">Always available for you.</p>
                        </div>
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h3 className="text-xl font-bold text-blue-500">Global Presence</h3>
                            <p className="mt-2 text-gray-600">Offices in 10+ countries.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
