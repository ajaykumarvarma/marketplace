import { Shield, Scale, Gavel, FileText } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function TermsPage() {
  return (
    <>
      <SEO title="Terms of Service — TradeVault" description="TradeVault terms of service and user agreement." />
      <div className="container py-12 md:py-20 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
            <Scale className="h-4 w-4" />
            Legal
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: August 11, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-muted-foreground">
          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-primary" />
              Acceptance of Terms
            </h2>
            <p>By accessing or using TradeVault, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the platform.</p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-primary" />
              Seller Obligations
            </h2>
            <p>Sellers must deliver products as described within the stated delivery time. All listings must be accurate and not infringe on intellectual property rights. TradeVault reserves the right to remove listings that violate these terms.</p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2 mb-3">
              <Gavel className="h-5 w-5 text-primary" />
              Dispute Resolution
            </h2>
            <p>Disputes are handled through our escrow-mediated resolution process. Both parties must cooperate with TradeVault's investigation. Decisions are final and binding.</p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Limitation of Liability</h2>
            <p>TradeVault's liability is limited to the amount paid for the transaction in question. We are not responsible for losses resulting from user error, fraud, or force majeure events.</p>
          </section>
        </div>
      </div>
    </>
  );
}