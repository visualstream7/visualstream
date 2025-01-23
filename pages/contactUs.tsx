import Nav from "@/components/nav";
import useCart from "@/components/nav/useCart";
import { useUser } from "@clerk/nextjs";
import React from "react";

export default function ContactUs() {

    const { user, isLoaded } = useUser();
    const { cartItems } = useCart({
        user: user,
        rerender: false,
        setRerenderNav: () => { },
    });

    return (
        <div className="bg-gray-50">
            <Nav user={user} cartCount={cartItems.length} />
            {/* Hero Section */}
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-[#1c2a36] via-[#25384c] to-[#40566b] text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold">Contact Us</h1>
                    <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
                        Have questions or need assistance? We're here to help!
                    </p>
                </div>
            </section>

            {/* Contact Information Section */}
            <section className="py-10">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Side - Address and Info */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Get in Touch
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Reach out to us through the following contact details, or fill out the form to send us a message directly.
                        </p>
                        <div className="mt-6">
                            <p className="flex items-center text-gray-700">
                                <span className="font-bold">📍 Address:</span>
                                <span className="ml-2">1234 Main Street, Cityville, Country</span>
                            </p>
                            <p className="flex items-center text-gray-700 mt-4">
                                <span className="font-bold">📞 Phone:</span>
                                <span className="ml-2">+1 234 567 890</span>
                            </p>
                            <p className="flex items-center text-gray-700 mt-4">
                                <span className="font-bold">📧 Email:</span>
                                <span className="ml-2">contact@company.com</span>
                            </p>
                            <p className="flex items-center text-gray-700 mt-4">
                                <span className="font-bold">🕒 Hours:</span>
                                <span className="ml-2">Mon-Fri: 9am - 6pm</span>
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Send Us a Message</h2>
                        <form className="bg-white shadow-lg rounded-lg p-6">
                            <div className="mb-4">
                                <label
                                    htmlFor="name"
                                    className="block text-gray-700 font-medium mb-2"
                                >
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="email"
                                    className="block text-gray-700 font-medium mb-2"
                                >
                                    Your Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="message"
                                    className="block text-gray-700 font-medium mb-2"
                                >
                                    Your Message
                                </label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    placeholder="Write your message here"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
