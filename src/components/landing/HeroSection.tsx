import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Clock, CheckCircle, Zap, TrendingUp, Users } from "lucide-react";
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
      {/* Very subtle background */}
      <div className="absolute inset-0 bg-mesh-violet" />
      
      <div className="container px-4 sm:px-6 relative pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="max-w-2xl mx-auto text-center">
          {/* Tagline */}
          <p className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Zap className="h-4 w-4" />
            Digital goods, delivered before the tab cools.
          </p>

          {/* Main heading — solid white, centered */}
          <h1 className={`font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-white transition-all duration-700 delay-100 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Buy once. Play now.
          </h1>

          {/* Subcopy — centered, readable */}
          <p className={`text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto mb-10 transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Game keys, licences, subscriptions and gift cards from vendors we can actually stand behind. No suspense. No duplicate keys. Just the code.
          </p>

          {/* CTAs — centered, solid colors */}
          <div className={`flex flex-wrap items-center justify-center gap-4 transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Link href="/marketplace">
              <Button className="h-12 px-8 bg-white text-black hover:bg-white/90 text-sm font-semibold gap-2 rounded-lg">
                Browse the drop
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sell">
              <Button variant="outline" className="h-12 px-8 text-sm font-semibold gap-2 border-white/30 text-white hover:bg-white/10 rounded-lg">
                Start selling
              </Button>
            </Link>
          </div>

          {/* Stats row — centered, clean */}
          <div className={`flex flex-wrap items-center justify-center gap-8 mt-14 pt-8 border-t border-border/50 transition-all duration-700 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">12K+</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Users</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">$2.4M</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">GMV Traded</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">99.7%</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}