import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";
import type { AppProps } from "next/app";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const messages = pageProps.messages;

  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <NextIntlClientProvider messages={messages} locale={pageProps.locale || "en"}>
          <CartProvider>
            <Layout>
              <Component {...pageProps} />
              <Toaster />
            </Layout>
          </CartProvider>
        </NextIntlClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}