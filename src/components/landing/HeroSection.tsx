import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Clock, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden border-b border-border">
      {/* Colorful gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-background to-cyan-950/20" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="container px-4 sm:px-6 relative pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="max-w-3xl">
          {/* Tagline with color */}
          <p className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary text-sm font-medium mb-6 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Zap className="h-4 w-4" />
            Digital goods, delivered before the tab cools.
          </p>

          {/* Main heading with gradient text */}
          <h1 className={`font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 transition-all duration-700 delay-100 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <span className="bg-gradient-to-r from-white via-primary to-accent bg-clip-text text-transparent">
              Buy once.
            </span>
            <br />
            <span className="text-foreground">Play now.</span>
          </h1>

          {/* Subcopy */}
          <p className={`text-lg text-muted-foreground leading-relaxed max-w-xl mb-8 transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Game keys, licences, subscriptions and gift cards from vendors we can actually stand behind. No suspense. No duplicate keys. Just the code.
          </p>

          {/* Colorful CTAs */}
          <div className={`flex flex-wrap items-center gap-4 transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Link href="/marketplace">
              <Button className="h-12 px-6 bg-gradient-to-r from-primary to-blue-500 text-white hover:opacity-90 text-sm font-medium gap-2 rounded-lg shadow-lg shadow-primary/25">
                Browse the drop
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sell">
              <Button variant="outline" className="h-12 px-6 text-sm font-medium gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary rounded-lg">
                Are you a vendor?
              </Button>
            </Link>
          </div>

          {/* Colorful trust pills */}
          <div className={`flex flex-wrap items-center gap-4 mt-12 pt-8 border-t border-border transition-all duration-700 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
              <CheckCircle className="h-3.5 w-3.5" />
              Every key pre-checked
            </div>
            <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full">
              <Shield className="h-3.5 w-3.5" />
              Escrow protected
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              Instant delivery
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}