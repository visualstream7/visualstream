import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        elements: {
          modalBackdrop: {
            position: "fixed",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          cardBox: {
            width: "100vw",
            height: "70vh",
            minHeight: "max-content",
            boxShadow: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
          card: {
            backgroundColor: "#1b1b1b",
            width: "100%",
            minWidth: "300px",
            maxWidth: "500px",
            margin: "0 auto",
          },
          headerSubtitle: {
            display: "none",
          },
          logoBox: {
            height: "100px",
          },
          logoImage: {
            borderRadius: "50%",
          },
          footer: {
            display: "none",
          },
          socialButtonsBlockButton: {
            backgroundColor: "#b2ebf5",
            color: "#1b1b1b",
            "&:hover": {
              backgroundColor: "#384572",
              color: "white",
            },
            padding: "12px",
          },
        },
      }}
    >
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
