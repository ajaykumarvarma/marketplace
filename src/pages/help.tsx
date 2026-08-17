import { HelpCircle, MessageSquare, Shield, Zap, BookOpen } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function HelpPage() {
  return (
    <>
      <SEO title="Help Center — TradeVault" description="Get help with buying, selling, and using TradeVault." />
      <div className="container py-12 md:py-20 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
            <HelpCircle className="h-4 w-4" />
            Support
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Help Center</h1>
          <p className="text-muted-foreground">Find answers to common questions about TradeVault</p>
        </div>

        <div className="grid gap-6 mb-8">
          {[
            {
              icon: Shield,
              title: "Is TradeVault safe?",
              answer: "Yes. All transactions are protected by our escrow system. Funds are held securely until the buyer confirms delivery. We also run velocity checks, IP reputation screening, and device fingerprinting to flag suspicious transactions before they complete.",
            },
            {
              icon: Zap,
              title: "How fast is delivery?",
              answer: "Most digital goods are delivered instantly or within minutes. Each listing shows an estimated delivery time. If a seller fails to deliver on time, the buyer can request a full refund.",
            },
            {
              icon: MessageSquare,
              title: "What if I have a dispute?",
              answer: "Open a dispute from your orders page. Our team will review the case within 24 hours. During the investigation, funds remain in escrow. Most disputes are resolved within 48 hours.",
            },
            {
              icon: BookOpen,
              title: "How do I become a seller?",
              answer: "Register an account and complete the seller verification process. You'll need to provide identity verification and link a payout method. Approval typically takes 1-2 business days.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <item.icon className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">{item.title}</h2>
              </div>
              <p className="text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>

        <div className="bg-muted border border-border rounded-lg p-8 text-center">
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">Still need help?</h3>
          <p className="text-muted-foreground mb-2">Our support team is available 24/7</p>
          <p className="font-mono text-primary">support@tradevault.io</p>
        </div>
      </div>
    </>
  );
}