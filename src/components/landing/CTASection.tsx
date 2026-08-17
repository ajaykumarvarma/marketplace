import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="container">
        <div className="relative overflow-hidden rounded-lg bg-card border border-border p-8 md:p-12 lg:p-16">
          <div className="relative flex flex-col items-center text-center max-w-2xl mx-auto gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
              <Shield className="h-4 w-4" />
              <span>Zero Fraud Tolerance</span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Ready to Trade with Confidence?
            </h2>

            <p className="text-foreground text-lg max-w-lg">
              Join thousands of buyers and sellers who trust TradeVault for secure, 
              escrow-protected digital goods transactions.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/auth/register">
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/security">
                <Button size="lg" variant="outline" className="gap-2 border-border hover:border-primary/30 font-medium">
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