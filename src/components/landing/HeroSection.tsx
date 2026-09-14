import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Clock, CheckCircle } from "lucide-react";
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
      <div className="container px-4 sm:px-6 relative pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="max-w-3xl">
          {/* Tagline */}
          <p className={`text-sm font-medium text-muted-foreground uppercase tracking-[0.2em] mb-6 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Digital goods, delivered before the tab cools.
          </p>

          {/* Main heading */}
          <h1 className={`font-display text-5xl sm:text-6xl md:text-7xl font-bold text-foreground leading-[1.05] tracking-tight mb-6 transition-all duration-700 delay-100 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Buy once.
            <br />
            <span className="text-muted-foreground">Play now.</span>
          </h1>

          {/* Subcopy */}
          <p className={`text-lg text-muted-foreground leading-relaxed max-w-xl mb-8 transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Game keys, licences, subscriptions and gift cards from vendors we can actually stand behind. No suspense. No duplicate keys. Just the code.
          </p>

          {/* CTA */}
          <div className={`flex flex-wrap items-center gap-4 transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Link href="/marketplace">
              <Button className="h-12 px-6 bg-foreground text-background hover:bg-foreground/90 text-sm font-medium gap-2 rounded-lg">
                Browse the drop
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sell">
              <Button variant="ghost" className="h-12 px-6 text-sm font-medium gap-2 text-muted-foreground hover:text-foreground">
                Are you a vendor?
              </Button>
            </Link>
          </div>

          {/* Trust pills */}
          <div className={`flex flex-wrap items-center gap-4 mt-12 pt-8 border-t border-border transition-all duration-700 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5" />
              Every key pre-checked
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Escrow protected
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Instant delivery
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}