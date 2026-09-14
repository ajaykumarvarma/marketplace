import { Search, ShoppingCart, PackageCheck, Store, BarChart3, Wallet } from "lucide-react";

const buyerSteps = [
  { icon: Search, color: "from-blue-500 to-cyan-500", title: "Browse & Search", description: "Filter by category, price, seller rating. Find verified listings with transparent reviews." },
  { icon: ShoppingCart, color: "from-emerald-500 to-teal-500", title: "Purchase with Escrow", description: "Pay securely. Funds held in escrow — released only when you confirm delivery." },
  { icon: PackageCheck, color: "from-violet-500 to-purple-500", title: "Receive & Confirm", description: "Get your digital goods instantly. Confirm delivery to complete the transaction." },
];

const sellerSteps = [
  { icon: Store, color: "from-amber-400 to-orange-500", title: "Create Your Store", description: "Set up a verified seller profile. List products with descriptions, prices, and delivery methods." },
  { icon: BarChart3, color: "from-rose-500 to-pink-500", title: "Sell & Fulfill", description: "Receive orders, deliver via our automated system or manual delivery. Track your sales." },
  { icon: Wallet, color: "from-indigo-500 to-violet-500", title: "Get Paid", description: "Request payouts to your preferred method. Weekly or on-demand withdrawals available." },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-mesh-warm relative">
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      <div className="absolute bottom-20 left-[5%] w-72 h-72 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl" />
      <div className="container px-4 sm:px-6 relative">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/10 text-amber-400 text-xs font-medium mb-4">
            <Search className="h-3 w-3" />
            How It Works
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple & Secure
          </h2>
          <p className="text-muted-foreground text-lg">
            Transparent for both sides of every transaction.
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
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg shrink-0`}>
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    {i < buyerSteps.length - 1 && <div className="w-px h-full bg-gradient-to-b from-primary/30 to-transparent mt-2" />}
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
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">For Sellers</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-col gap-6">
              {sellerSteps.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg shrink-0`}>
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    {i < sellerSteps.length - 1 && <div className="w-px h-full bg-gradient-to-b from-primary/30 to-transparent mt-2" />}
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