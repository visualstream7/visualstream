import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { appearance } from "@/data/clerk_appearance";
import { ToastContainer } from "react-toastify";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { useState } from "react";

function LaunchingSoon({ password, setPassword }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex flex-col items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Coming Soon</h1>
          <p className="text-white/80">We're working on something amazing!</p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Enter Access Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-300 text-white placeholder-white/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={() => {}}
            className="w-full bg-white text-purple-800 hover:bg-purple-100 font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
          >
            Get Early Access
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20 text-center">
          <p className="text-white/60 text-sm">
            Sign up for updates and exclusive previews
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const [password, setPassword] = useState("");

  if (password !== "12345678") {
    return <LaunchingSoon password={password} setPassword={setPassword} />;
  }
  return (
    <ClerkProvider appearance={appearance}>
      <GoogleAnalytics gaMeasurementId="G-E299JNFPKD" />
      <Component {...pageProps} />
      <ToastContainer />
    </ClerkProvider>
  );
}
