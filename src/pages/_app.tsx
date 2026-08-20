import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NextIntlClientProvider } from "next-intl";
import { useRouter } from "next/router";
import * as Sentry from "@sentry/nextjs";
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
    <Sentry.ErrorBoundary fallback={({ error, resetError }) => (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8">
        <h1 className="font-display text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-6 max-w-md text-center">
          We&apos;ve been notified and are working on a fix. Try refreshing the page.
        </p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    )}>
      <AuthProvider>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <CartProvider>
              <Layout>
                <ErrorBoundary>
                  <Component {...pageProps} />
                </ErrorBoundary>
                <Toaster />
              </Layout>
            </CartProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </AuthProvider>
    </Sentry.ErrorBoundary>
  );
}