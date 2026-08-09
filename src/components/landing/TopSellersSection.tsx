import Link from "next/link";
import { Star, TrendingUp, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const sellers = [
  { name: "NexusKeys", badge: "Verified", rating: 4.98, sales: 3420, avatar: "N", color: "bg-primary/20 text-primary" },
  { name: "PixelForge", badge: "Verified", rating: 4.95, sales: 2187, avatar: "P", color: "bg-accent/20 text-accent" },
  { name: "CodeVault", badge: "Trusted", rating: 4.92, sales: 1563, avatar: "C", color: "bg-success/20 text-success" },
  { name: "GameHub Pro", badge: "Verified", rating: 4.89, sales: 4231, avatar: "G", color: "bg-warning/20 text-warning" },
];

const featuredProducts = [
  { title: "Steam Game Key Bundle", price: 12.99, originalPrice: 49.99, seller: "NexusKeys", category: "Game Keys", sales: 124 },
  { title: "Adobe Creative Suite License", price: 89.00, originalPrice: 299.00, seller: "PixelForge", category: "Software", sales: 67 },
  { title: "Netflix Premium 1-Year", price: 24.99, originalPrice: 198.00, seller: "CodeVault", category: "Accounts", sales: 342 },
  { title: "Spotify Family 6-Month", price: 8.99, originalPrice: 54.00, seller: "GameHub Pro", category: "Accounts", sales: 891 },
];

export function TopSellersSection() {
  return (
    <section className="py-16 md:py-24 border-y border-border bg-card/30">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Top Sellers
            </h2>
            <p className="text-muted-foreground mb-8">
              Verified sellers with proven track records. Every badge earned through real transactions and verified identity.
            </p>

            <div className="space-y-4">
              {sellers.map((seller) => (
                <div key={seller.name} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${seller.color}`}>
                    {seller.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm truncate">{seller.name}</span>
                      <Shield className="h-3 w-3 text-success" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-warning fill-warning" />
                        {seller.rating}
                      </span>
                      <span className="font-mono">{seller.sales.toLocaleString()} sales</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-6 gap-2 border-border" size="sm">
              View All Sellers
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-foreground">Featured Products</h3>
              <Link href="/marketplace" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Browse All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredProducts.map((product) => (
                <div key={product.title} className="group p-5 bg-card border border-border rounded-lg hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {product.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span className="font-mono">{product.sales}</span>
                    </div>
                  </div>

                  <h4 className="font-display font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h4>

                  <div className="flex items-end gap-2 mb-3">
                    <span className="font-mono text-lg font-semibold text-accent">${product.price.toFixed(2)}</span>
                    <span className="font-mono text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">by {product.seller}</span>
                    <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}