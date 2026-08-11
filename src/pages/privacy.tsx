import { Shield, Lock, Eye, Server } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function PrivacyPage() {
  return (
    <>
      <SEO title="Privacy Policy — TradeVault" description="TradeVault privacy policy and data protection practices." />
      <div className="container py-12 md:py-20 max-w-3xl mx-auto space-y-10">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
            <Shield className="h-3.5 w-3.5" />
            Legal
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: August 11, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Data We Collect
            </h2>
            <p>We collect information you provide directly, including account details, transaction history, and communications. We also collect technical data such as IP addresses, device information, and usage patterns to enhance security and platform performance.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              How We Use Your Data
            </h2>
            <p>Your data powers our fraud detection systems, enables secure transactions, and helps us improve the marketplace experience. We never sell your personal information to third parties.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Data Security
            </h2>
            <p>All data is encrypted at rest and in transit using AES-256 and TLS 1.3. We maintain SOC 2 Type II compliance and conduct regular security audits.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. Contact our Data Protection Officer at privacy@tradevault.io for any data-related requests.</p>
          </section>
        </div>
      </div>
    </>
  );
}