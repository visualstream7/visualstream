import Nav from "@/components/nav";
import useCart from "@/components/nav/useCart";
import { useUser } from "@clerk/nextjs";
import React from "react";

export default function AboutUs() {
    const { user, isLoaded } = useUser();
    const { cartItems } = useCart({
        user: user,
        rerender: false,
        setRerenderNav: () => { },
    });

    return (
        <div className="h-screen flex flex-col bg-white">
            {/* Fixed Navbar */}
            <div className="sticky top-0 z-50 bg-white shadow-md">
                <Nav user={user} cartCount={cartItems.length} />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white py-20">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-5xl font-extrabold leading-tight">
                            About <span className="text-blue-500">VisualStream.ai</span>
                        </h1>
                        <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-gray-300">
                            Merging AI creativity with seamless automation, empowering creators,
                            businesses, and art lovers to transform ideas into life—one print at a time.
                        </p>
                    </div>
                </section>

                {/* Vision and Mission Section */}
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-800">Our Vision</h2>
                            <p className="mt-4 text-gray-600 leading-relaxed">
                                To be the ultimate AI-driven design hub, where creativity meets
                                technology, empowering anyone to turn inspiration into reality
                                effortlessly.
                            </p>
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold text-gray-800">Our Mission</h2>
                            <p className="mt-4 text-gray-600 leading-relaxed">
                                We harness cutting-edge AI and automation to deliver
                                trend-driven, high-quality prints—helping businesses and
                                individuals create custom, on-demand products with speed,
                                precision, and innovation.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-4xl font-bold text-gray-800 mb-12">
                            Why <span className="text-blue-500">VisualStream.ai?</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                            <div className="p-6 bg-gray-50 shadow-md border border-gray-200 rounded-lg hover:shadow-lg transition">
                                <h3 className="text-2xl font-semibold text-blue-500 mb-4">
                                    AI-Powered Trends
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Stay ahead with visuals curated from real-time data.
                                </p>
                            </div>
                            <div className="p-6 bg-gray-50 shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition">
                                <h3 className="text-2xl font-semibold text-blue-500 mb-4">
                                    Effortless Customization
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Find the perfect design in seconds with color-based and tag
                                    search.
                                </p>
                            </div>
                            <div className="p-6 bg-gray-50 shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition">
                                <h3 className="text-2xl font-semibold text-blue-500 mb-4">
                                    Seamless Fulfillment
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Print on anything, from mugs to apparel, directly through
                                    Printful.
                                </p>
                            </div>
                            <div className="p-6 bg-gray-50 shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition">
                                <h3 className="text-2xl font-semibold text-blue-500 mb-4">
                                    No Hassle, Just Creativity
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    We handle everything, so you focus on expressing yourself.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-4xl font-bold text-gray-800">
                            Join Us in Reshaping the Future
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                            Creativity is limitless at VisualStream.ai. Let’s revolutionize the
                            print-on-demand industry—where every image tells a story.
                        </p>
                        <button className="mt-8 px-10 py-4 text-white bg-blue-600 font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                            Get Started
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
