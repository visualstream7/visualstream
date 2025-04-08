import Nav from "@/components/nav";
import useCart from "@/components/nav/useCart";
import { SupabaseWrapper } from "@/database/supabase";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  displayName?: string; // or display_name if that's the field name in your DB
  priority?: number;
}

export default function ContactUs() {
  const { user, isLoaded } = useUser();
  const { cartItems } = useCart({
    user: user,
    rerender: false,
    setRerenderNav: () => {},
  });
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setErrors({ ...errors, [e.target.id]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors = { name: "", email: "", message: "" };

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.message.trim()) newErrors.message = "Message cannot be empty";

    if (Object.values(newErrors).some((error) => error)) {
      setErrors(newErrors);
      return;
    }

    try {
      setStatus("Sending...");
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("Failed to send message. Try again.");
      }
    } catch (error) {
      setStatus("Something went wrong. Try again later.");
    }
  };

  useEffect(() => {
    async function fetchCategories() {
      let supabase = new SupabaseWrapper("CLIENT");
      const { result, error } = await supabase.getAutomateCategories();
      if (result) {
        const sortedCategories = (result as Category[])
          .slice()
          .sort((a, b) => (a.priority || 0) - (b.priority || 0));

        setCategories(sortedCategories);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="bg-gray-50">
      <Nav user={user} cartCount={cartItems.length} categories={categories} />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold">
            Contact <span className="text-blue-500">Us</span>{" "}
          </h1>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-10 mb-8 lg:py-6">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Reach out to us through the following contact details
            </p>
            <div className="mt-6">
              <p className="flex items-center text-gray-700 mt-4">
                <span className="font-bold">📞 Phone:</span>
                <span className="ml-2">+1 858 205 7530</span>
              </p>
              <p className="flex items-center text-gray-700 mt-4">
                <span className="font-bold">📧 Email:</span>
                <span className="ml-2">visualstream.ai@gmail.com</span>
              </p>
              <p className="flex items-center text-gray-700 mt-4">
                <span className="font-bold">🕒 Hours:</span>
                <span className="ml-2">Mon-Fri: 9am - 6pm</span>
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="sm:mb-4 lg:p-0">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Send Us a Message
            </h2>
            <form
              className="bg-white shadow-lg border border-gray-200 rounded-lg p-6"
              onSubmit={handleSubmit}
            >
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
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
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
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
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
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Write your message here"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
              >
                Send Message
              </button>
              {status && (
                <p className="mt-4 text-center text-gray-700">{status}</p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
