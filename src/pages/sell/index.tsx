import Link from "next/link";
import { Store, Shield, TrendingUp, Wallet, BarChart3, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

const features = [
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Create your shop in under 2 minutes. No verification delays for standard sellers.",
  },
  {
    icon: Shield,
    title: "Fraud Protection",
    description: "Built-in chargeback protection and our escrow system keeps both parties safe.",
  },
  {
    icon: Wallet,
    title: "Low Fees",
    description: "Just 5% per transaction. No monthly fees, no setup costs, no hidden charges.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Real-time sales data, customer insights, and revenue tracking at your fingertips.",
  },
  {
    icon: TrendingUp,
    title: "Growth Tools",
    description: "Featured listings, promotional badges, and SEO optimization to boost visibility.",
  },
  {
    icon: Store,
    title: "Custom Shop",
    description: "Your own branded storefront with custom URL, logo, and product collections.",
  },
];

const steps = [
  "Create your seller account",
  "List your digital products",
  "Set your prices and delivery method",
  "Start selling worldwide",
];

export default function SellPage() {
  return (
    <>
      <SEO title="Start Selling — TradeVault" description="Sell your digital goods on TradeVault. Low fees, instant setup, and fraud protection." />
      <div className="space-y-0">
        <section className="border-b border-border">
          <div className="container py-16 md:py-24 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
              <Store className="h-3.5 w-3.5" />
              <span>Seller Program</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground max-w-2xl mx-auto">
              Turn Your Digital Goods Into{" "}
              <span className="text-gradient">Revenue</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Join 1,200+ sellers earning on TradeVault. Low fees, instant payouts, and enterprise-grade security.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                Become a Seller
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-border hover:bg-muted">
                View Seller Fees
              </Button>
            </div>
          </div>
        </section>

        <section className="container py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-card border border-border rounded-lg p-6 space-y-3 hover:border-primary/20 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-card">
          <div className="container py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="font-display text-3xl font-bold text-foreground">Start Selling in 4 Simple Steps</h2>
                <div className="space-y-4">
                  {steps.map((step, i) => (
                    <div key={step} className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-mono font-medium text-primary">
                        {i + 1}
                      </div>
                      <span className="text-foreground">{step}</span>
                    </div>
                  ))}
                </div>
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Create Seller Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-muted border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Seller Dashboard Preview</span>
                  <Badge className="bg-success/10 text-success border-success/20 text-xs">Live</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                    <span className="font-mono text-foreground">$12,847.50</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-mono text-accent">+$3,240.00</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Active Orders</span>
                    <span className="font-mono text-foreground">23</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <span className="font-mono text-success">99.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="container py-16 md:py-20 text-center space-y-6">
            <h2 className="font-display text-3xl font-bold text-foreground">Ready to Start Selling?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Join the fastest growing marketplace for digital goods. No setup fees, no monthly charges.
            </p>
            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Store className="h-4 w-4" />
              Become a Seller Today
            </Button>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" /> 5% Fee Only</span>
              <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" /> Instant Payouts</span>
              <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" /> 24/7 Support</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}