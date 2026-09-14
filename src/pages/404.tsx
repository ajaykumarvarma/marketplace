import Head from "next/head";
import Link from "next/link";
import { Shield, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 — Page Not Found | TradeVault</title>
        <meta name="description" content="Page not found" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-mesh-violet" />
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="absolute top-20 right-[15%] w-80 h-80 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[10%] w-72 h-72 bg-gradient-to-tr from-accent/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-violet-500/15 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <div className="relative text-center px-4">
          <div className="bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl p-10 md:p-14 shadow-card-hover max-w-md mx-auto">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg flex items-center justify-center">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <span className="absolute -top-2 -right-2 font-mono text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded backdrop-blur-sm">
                ERR_404
              </span>
            </div>
            <div className="mb-6">
              <h1 className="font-display text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-2">404</h1>
              <p className="text-lg text-muted-foreground max-w-md">
                This page doesn't exist or has been moved. Check the URL or return to safety.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" className="gap-2 border-border/60 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-primary to-blue-500 text-white hover:opacity-90 shadow-lg shadow-primary/25 border-0" asChild>
                <Link href="/marketplace">
                  <Zap className="h-4 w-4" />
                  Browse Marketplace
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}