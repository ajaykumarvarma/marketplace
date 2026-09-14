import { Shield, Lock, Eye, BadgeCheck, Clock, Headphones } from "lucide-react";

const trustItems = [
  {
    icon: Shield,
    color: "from-emerald-500 to-teal-500",
    title: "Escrow Protection",
    description: "Funds held in secure escrow until delivery is confirmed. No more chargebacks or scams.",
  },
  {
    icon: Lock,
    color: "from-blue-500 to-cyan-500",
    title: "Fraud Detection",
    description: "Velocity checks, IP reputation, and device fingerprinting flag suspicious transactions before they complete.",
  },
  {
    icon: Eye,
    color: "from-violet-500 to-purple-500",
    title: "Transparent Reviews",
    description: "Verified purchase reviews only. Every rating is tied to a completed, escrow-backed transaction.",
  },
  {
    icon: BadgeCheck,
    color: "from-amber-400 to-orange-500",
    title: "Verified Sellers",
    description: "Sellers undergo identity verification and transaction history review before badge approval.",
  },
  {
    icon: Clock,
    color: "from-rose-500 to-pink-500",
    title: "Instant Delivery",
    description: "Automated delivery system sends purchased goods the moment payment clears escrow.",
  },
  {
    icon: Headphones,
    color: "from-indigo-500 to-violet-500",
    title: "24/7 Dispute Support",
    description: "Dedicated resolution team handles disputes within 24 hours with full transaction audit trails.",
  },
];

export function TrustSignalsSection() {
  return (
    <section className="py-16 md:py-24 border-b border-border bg-tint-violet relative">
      <div className="absolute inset-0 bg-dot-pattern opacity-30" />
      <div className="container px-4 sm:px-6 relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-medium mb-4">
            <Shield className="h-3 w-3" />
            Security First
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why TradeVault?
          </h2>
          <p className="text-muted-foreground text-lg">
            Built from the ground up for security. Every feature exists to protect buyers 
            and empower legitimate sellers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="p-6 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}