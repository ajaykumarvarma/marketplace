import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import { CartProvider } from "@/contexts/CartContext";
import type { AppProps } from "next/app";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Layout>
        <Component {...pageProps} />
        <Toaster />
      </Layout>
    </CartProvider>
  );
}