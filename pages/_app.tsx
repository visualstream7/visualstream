import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { appearance } from "@/data/clerk_appearance";
import { ToastContainer } from "react-toastify";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { useState } from "react";

function LaunchingSoon({ password, setPassword }: any) {
  return (
    <div>
      <h1>Launching Soon</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
      />
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
