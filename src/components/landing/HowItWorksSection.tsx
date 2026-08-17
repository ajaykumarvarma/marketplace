import { Search, ShoppingCart, PackageCheck, Store, BarChart3, Wallet } from "lucide-react";

const buyerSteps = [
  { icon: Search, title: "Browse & Search", description: "Filter by category, price, seller rating. Find verified listings with transparent reviews." },
  { icon: ShoppingCart, title: "Purchase with Escrow", description: "Pay securely. Funds held in escrow — released only when you confirm delivery." },
  { icon: PackageCheck, title: "Receive & Confirm", description: "Get your digital goods instantly. Confirm delivery to complete the transaction." },
];

const sellerSteps = [
  { icon: Store, title: "Create Your Store", description: "Set up a verified seller profile. List products with descriptions, prices, and delivery methods." },
  { icon: BarChart3, title: "Sell & Fulfill", description: "Receive orders, deliver via our automated system or manual delivery. Track your sales." },
  { icon: Wallet, title: "Get Paid", description: "Request payouts to your preferred method. Weekly or on-demand withdrawals available." },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg">
            Simple, secure, and transparent for both sides of every transaction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">For Buyers</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-col gap-6">
              {buyerSteps.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 border border-primary/30 shrink-0">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    {i < buyerSteps.length - 1 && <div className="w-px h-full bg-border mt-2" />}
                  </div>
                  <div className="pb-6">
                    <h3 className="font-display font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-mono uppercase tracking-wider text-primary">For Sellers</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-col gap-6">
              {sellerSteps.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 border border-primary/30 shrink-0">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    {i < sellerSteps.length - 1 && <div className="w-px h-full bg-border mt-2" />}
                  </div>
                  <div className="pb-6">
                    <h3 className="font-display font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}