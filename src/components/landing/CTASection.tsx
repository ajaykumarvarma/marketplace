import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-16 md:py-24 border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-violet" />
      <div className="absolute inset-0 bg-dot-pattern opacity-30" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-tl from-cyan-500/15 to-transparent rounded-full blur-3xl" />
      
      <div className="container px-4 sm:px-6 relative">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card/90 to-accent/10 border border-primary/20 p-8 md:p-12 lg:p-16 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl" />

          <div className="relative flex flex-col items-center text-center max-w-2xl mx-auto gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium backdrop-blur-sm">
              <Shield className="h-4 w-4" />
              <span>Zero Fraud Tolerance</span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Ready to Trade with Confidence?
            </h2>

            <p className="text-muted-foreground text-lg max-w-lg">
              Join thousands of buyers and sellers who trust TradeVault for secure, 
              escrow-protected digital goods transactions.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/auth/register">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-blue-500 text-white hover:opacity-90 font-medium shadow-lg shadow-primary/25 border-0 h-12 px-8">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/security">
                <Button size="lg" variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10 font-medium h-12 px-8 backdrop-blur-sm">
                  Learn About Fees
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground">
              No credit card required. Start selling in minutes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}