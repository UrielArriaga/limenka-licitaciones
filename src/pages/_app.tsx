import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.className} min-h-screen antialiased`}>
      <Toaster
        richColors
        position="top-right"
        closeButton
        toastOptions={{
          className: 'text-sm font-sans',
        }}
      />
      <Component {...pageProps} />
    </div>
  );
}
