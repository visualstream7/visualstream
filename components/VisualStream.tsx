"use client";

import { useState } from "react";
import Image from "next/image";

export default function VisualStream({ onContinue }: { onContinue: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    const handleContinue = () => {
        setIsVisible(false); 
        onContinue();
    };

    return (
        isVisible && (
            <div className="fixed inset-0 z-50 h-screen w-full flex flex-col justify-end items-center pb-10 px-6">
                <Image
                    src="/vs.png"
                    alt="Visual Stream Background"
                    layout="fill"
                    objectFit="cover"
                    className="absolute inset-0"
                />

                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative text-white w-full text-left">
                    <h1 className="text-4xl font-bold">VisualStream</h1>
                    <p className="mt-2 text-md">
                        Discover unique designs inspired by real-time trends. Customize your
                        favorite products like t-shirts, mugs, and backpacks with colors and styles
                        that reflect your personality. Unlimited creativity, delivered to your door!
                    </p>
                    <div className="flex justify-center space-x-2 mt-4">
                        <span className="h-2 w-2 bg-white rounded-full"></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full"></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full"></span>
                    </div>
                 <button
                        className="mt-6 w-full max-w-xs py-3 m-auto bg-white text-black font-semibold rounded-full flex items-center justify-center"
                        onClick={handleContinue}
                    >
                        Continue <span className="ml-2">→</span>
                    </button>
                </div>
            </div>
        )
    );
}
