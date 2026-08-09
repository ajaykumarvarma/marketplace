import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustSignalsSection } from "@/components/landing/TrustSignalsSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { TopSellersSection } from "@/components/landing/TopSellersSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CTASection } from "@/components/landing/CTASection";

export default function Home() {
  return (
    <>
      <SEO />
      <HeroSection />
      <TrustSignalsSection />
      <CategoriesSection />
      <TopSellersSection />
      <HowItWorksSection />
      <CTASection />
    </>
  );
}