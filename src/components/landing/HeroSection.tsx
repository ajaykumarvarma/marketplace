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
      <div className="container relative pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 flex flex-col gap-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
              <Shield className="h-4 w-4" />
              <span>Escrow-Protected Transactions</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
              The Secure Marketplace for{" "}
              <span className="text-accent">Digital Goods</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
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
                <Button size="lg" variant="outline" className="gap-2 border-border font-medium">
                  Start Selling
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-foreground ${i > 1 ? "-ml-2" : ""}`}>
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>Trusted by <span className="text-foreground font-medium">1,200+</span> sellers worldwide</span>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Live Transaction</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-xs text-success font-mono">ONLINE</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-accent">TV-2847-XF</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-2">
                  <div className="h-full w-3/4 bg-primary rounded-full" />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Processing escrow...</span>
                  <span className="font-mono">74%</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Amount</span>
                  <span className="font-mono text-foreground">$47.99</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Method</span>
                  <span className="font-mono text-foreground">Escrow</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-mono text-lg font-semibold text-foreground">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}