"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SupabaseWrapper } from "@/database/supabase";

export default function VisualStream({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState(1);

  // const images = ["/vs.png", "/vs.png", "/vs.png"];
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const client = new SupabaseWrapper("CLIENT");
    client.getLatestImages(3).then((data) => {
      let { result, error } = data;
      if (result) {
        console.log(result);
        setImages(result.map((image: any) => image.low_resolution_image_url));
      }
    });
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [images]);

  const handleContinue = () => {
    setIsVisible(false);
    onContinue();
  };

  return (
    isVisible && (
      <div className="fixed inset-0 z-50 h-screen w-full flex flex-col justify-end items-center pb-10 px-6 overflow-hidden">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-black"></div>
          <AnimatePresence custom={direction} initial={false}>
            <motion.div
              key={currentImage}
              className="absolute inset-0 w-full h-full"
              initial={{ x: direction * 100 + "%", opacity: 0.2 }}
              animate={{ x: "0%", opacity: 1 }}
              exit={{ x: -direction * 100 + "%", opacity: 0.6 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ willChange: "transform, opacity" }}
            >
              <img
                src={images[currentImage]}
                alt="Visual Stream Background"
                className="w-full h-full"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute inset-0 bg-black opacity-50"></div>

        <div className="relative text-white w-full text-left">
          <h1 className="text-4xl font-bold mb-4">VisualStream</h1>
          <p className="mt-2 text-md">
            Discover unique designs inspired by real-time trends. Customize your
            favorite products like t-shirts, mugs, and backpacks with colors and
            styles that reflect your personality. Unlimited creativity,
            delivered to your door!
          </p>

          <div className="flex justify-center space-x-2 mt-4">
            {images.map((_, index) => (
              <span
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentImage ? "bg-white scale-110" : "bg-gray-400"
                }`}
              ></span>
            ))}
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
