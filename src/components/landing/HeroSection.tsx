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
      {/* Rich layered background */}
      <div className="absolute inset-0 bg-mesh-violet" />
      <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern opacity-50" />
      
      {/* Floating gradient orbs */}
      <div className="absolute top-20 right-[15%] w-72 h-72 bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute bottom-10 left-[10%] w-96 h-96 bg-gradient-to-tr from-cyan-500/10 to-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "12s" }} />
      <div className="absolute top-1/2 right-[5%] w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "10s" }} />

      <div className="container px-4 sm:px-6 relative pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="max-w-3xl">
          {/* Tagline — solid background, no glass */}
          <p className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Zap className="h-4 w-4" />
            Digital goods, delivered before the tab cools.
          </p>

          {/* Main heading — SOLID WHITE, no gradient clip */}
          <h1 className={`font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 text-white transition-all duration-700 delay-100 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Buy once.
            <br />
            <span className="text-white/80">Play now.</span>
          </h1>

          {/* Subcopy */}
          <p className={`text-lg text-muted-foreground leading-relaxed max-w-xl mb-8 transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Game keys, licences, subscriptions and gift cards from vendors we can actually stand behind. No suspense. No duplicate keys. Just the code.
          </p>

          {/* CTAs */}
          <div className={`flex flex-wrap items-center gap-4 transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Link href="/marketplace">
              <Button className="h-12 px-6 bg-white text-black hover:bg-white/90 text-sm font-semibold gap-2 rounded-lg">
                Browse the drop
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sell">
              <Button variant="outline" className="h-12 px-6 text-sm font-semibold gap-2 border-white/30 text-white hover:bg-white/10 rounded-lg">
                Are you a vendor?
              </Button>
            </Link>
          </div>

          {/* Stats row */}
          <div className={`flex flex-wrap items-center gap-6 mt-10 pt-6 border-t border-border/50 transition-all duration-700 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">12K+</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Users</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">$2.4M</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">GMV Traded</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">99.7%</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Success Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side floating product cards */}
        <div className="hidden lg:block absolute top-1/2 right-[5%] -translate-y-1/2 w-80">
          <div className={`transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <div className="bg-card border border-border rounded-xl p-4 shadow-lg mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-sm font-bold text-white">
                  N
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Nitro Subscription</p>
                  <p className="text-xs text-muted-foreground">Instant delivery</p>
                </div>
                <span className="ml-auto font-mono text-sm font-bold text-emerald-400">$4.99</span>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 shadow-lg mb-4 ml-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                  S
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Spotify Premium</p>
                  <p className="text-xs text-muted-foreground">3 month key</p>
                </div>
                <span className="ml-auto font-mono text-sm font-bold text-emerald-400">$8.50</span>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                  A
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Adobe Creative Suite</p>
                  <p className="text-xs text-muted-foreground">Annual licence</p>
                </div>
                <span className="ml-auto font-mono text-sm font-bold text-emerald-400">$89.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}