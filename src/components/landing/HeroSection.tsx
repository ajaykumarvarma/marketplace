import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, ArrowRight, TrendingUp, Users, Package, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { icon: Package, label: "Products Sold", value: 2847, suffix: "+" },
  { icon: Users, label: "Active Users", value: 1253, suffix: "+" },
  { icon: TrendingUp, label: "Success Rate", value: 99.7, suffix: "%" },
  { icon: Clock, label: "Avg. Delivery", value: 3, suffix: "min" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Number(current.toFixed(value % 1 !== 0 ? 1 : 0)));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span className="tabular-nums">{count.toLocaleString()}{suffix}</span>;
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.08)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(var(--accent)/0.05)_0%,_transparent_40%)]" />

      <div className="container relative pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
              <Shield className="h-3.5 w-3.5" />
              <span>Escrow-Protected Transactions</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
              The Secure Marketplace for{" "}
              <span className="text-gradient">Digital Goods</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
              Buy and sell game keys, accounts, software licenses, and digital services with 
              built-in fraud protection, instant delivery, and escrow-backed trust.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/marketplace">
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                  Browse Marketplace
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sell">
                <Button size="lg" variant="outline" className="gap-2 border-border hover:bg-muted font-medium">
                  Start Selling
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium text-foreground">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>Trusted by <span className="text-foreground font-medium">1,200+</span> sellers worldwide</span>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-xl blur-2xl" />
              <div className="relative bg-card border border-border rounded-lg p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Live Platform Stats</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
                    <span className="text-xs text-success font-mono">ONLINE</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="bg-muted/50 rounded-md p-4 border border-border/50">
                      <stat.icon className="h-4 w-4 text-primary mb-2" />
                      <div className="font-mono text-xl font-semibold text-foreground">
                        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Recent Transaction</span>
                    <span className="font-mono text-accent">TV-2847-XF</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Processing...</span>
                    <span className="font-mono">74%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}