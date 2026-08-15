import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";
import { useRouter } from "next/router";
import type { AppProps } from "next/app";
import "@/styles/globals.css";

import messagesEn from "../../messages/en.json";
import messagesEs from "../../messages/es.json";

const messagesByLocale: Record<string, typeof messagesEn> = {
  en: messagesEn,
  es: messagesEs,
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const locale = router.locale || "en";
  const messages = messagesByLocale[locale] || messagesEn;

  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <NextIntlClientProvider messages={messages} locale={locale}>
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