import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustSignalsSection } from "@/components/landing/TrustSignalsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { TopSellersSection } from "@/components/landing/TopSellersSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CTASection } from "@/components/landing/CTASection";

export default function Home() {
  return (
    <>
      <SEO
        title="TradeVault — Secure Digital Goods Marketplace"
        description="Buy and sell digital goods with escrow protection. Game keys, accounts, software, subscriptions, and more. Trusted by 50,000+ users."
        image="https://tradevault.io/og-image.png"
        url="https://tradevault.io"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "TradeVault",
          url: "https://tradevault.io",
          logo: "https://tradevault.io/logo.png",
          sameAs: [
            "https://twitter.com/tradevault",
            "https://github.com/tradevault"
          ],
          description: "Secure digital goods marketplace with escrow protection."
        }}
      />
      <HeroSection />
      <TrustSignalsSection />
      <TestimonialsSection />
      <CategoriesSection />
      <TopSellersSection />
      <HowItWorksSection />
      <CTASection />
    </>
  );
}