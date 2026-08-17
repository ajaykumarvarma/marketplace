import { Shield, Lock, Eye, BadgeCheck, Clock, Headphones } from "lucide-react";

const trustItems = [
  {
    icon: Shield,
    title: "Escrow Protection",
    description: "Funds held in secure escrow until delivery is confirmed. No more chargebacks or scams.",
  },
  {
    icon: Lock,
    title: "Fraud Detection",
    description: "Velocity checks, IP reputation, and device fingerprinting flag suspicious transactions before they complete.",
  },
  {
    icon: Eye,
    title: "Transparent Reviews",
    description: "Verified purchase reviews only. Every rating is tied to a completed, escrow-backed transaction.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Sellers",
    description: "Sellers undergo identity verification and transaction history review before badge approval.",
  },
  {
    icon: Clock,
    title: "Instant Delivery",
    description: "Automated delivery system sends purchased goods the moment payment clears escrow.",
  },
  {
    icon: Headphones,
    title: "24/7 Dispute Support",
    description: "Dedicated resolution team handles disputes within 24 hours with full transaction audit trails.",
  },
];

export function TrustSignalsSection() {
  return (
    <section className="py-16 md:py-24 border-b border-border">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
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
              className="p-6 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1.5">{item.title}</h3>
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