import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { appearance } from "@/data/clerk_appearance";
import { ToastContainer } from "react-toastify";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider appearance={appearance}>
      <Component {...pageProps} />
      <ToastContainer />
    </ClerkProvider>
  );
}
