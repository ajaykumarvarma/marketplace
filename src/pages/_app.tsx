import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import { CartProvider } from "@/contexts/CartContext";
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { ThemeProvider } from "lucide-react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <CartProvider>
        <Layout>
          <Component {...pageProps} />
          <Toaster />
        </Layout>
      </CartProvider>
    </ThemeProvider>
  );
}