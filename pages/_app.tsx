import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { appearance } from "@/data/clerk_appearance";
import { ToastContainer } from "react-toastify";
import { GoogleAnalytics } from "nextjs-google-analytics";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider appearance={appearance}>
      <GoogleAnalytics gaMeasurementId="G-E299JNFPKD" />
      <Component {...pageProps} />
      <ToastContainer />
    </ClerkProvider>
  );
}
