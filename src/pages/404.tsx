import Head from "next/head";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 — Page Not Found | TradeVault</title>
        <meta name="description" content="Page not found" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center">
              <Shield className="h-10 w-10 text-primary/30" />
            </div>
            <span className="absolute -top-2 -right-2 font-mono text-xs bg-muted border border-border px-2 py-0.5 rounded text-muted-foreground">
              ERR_404
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-5xl font-bold text-foreground">404</h1>
            <p className="text-lg text-muted-foreground max-w-md">
              This page doesn't exist or has been moved. Check the URL or return to safety.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" className="gap-2 border-border hover:bg-muted" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90" asChild>
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}