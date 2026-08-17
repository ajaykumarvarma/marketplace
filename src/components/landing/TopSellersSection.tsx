import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, TrendingUp, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface TopSeller {
  id: string;
  full_name: string | null;
  verification_tier: string | null;
  role: string;
}

interface FeaturedProduct {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  category: string | null;
  seller: { full_name: string | null; verification_tier: string | null } | null;
}

export function TopSellersSection() {
  const [sellers, setSellers] = useState<TopSeller[]>([]);
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [sellersRes, productsRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, verification_tier, role").eq("role", "seller").order("created_at", { ascending: false }).limit(4),
      supabase.from("products").select("id, title, price, original_price, category, seller:seller_id(full_name, verification_tier)").eq("status", "active").order("created_at", { ascending: false }).limit(4),
    ]);

    if (sellersRes.data) setSellers(sellersRes.data as unknown as TopSeller[]);
    if (productsRes.data) setProducts(productsRes.data as unknown as FeaturedProduct[]);
    setLoading(false);
  }

  const tierBadge = (tier: string | null) => {
    switch (tier) {
      case "gold": return "bg-muted text-foreground border-border";
      case "silver": return "bg-muted text-foreground border-border";
      case "bronze": return "bg-muted text-foreground border-border";
      default: return "bg-muted text-foreground border-border";
    }
  };

  return (
    <section className="py-16 md:py-24 border-y border-border bg-muted">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Top Sellers
            </h2>
            <p className="text-muted-foreground mb-8">
              Verified sellers with proven track records. Every badge earned through real transactions and verified identity.
            </p>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
              </div>
            ) : (
              <div>
                {sellers.map((seller) => (
                  <Link key={seller.id} href={`/sellers/${seller.id}`}>
                    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-border mb-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground">
                        {(seller.full_name || "S")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground text-sm truncate">{seller.full_name || "Unnamed Seller"}</span>
                          <Shield className="h-3 w-3 text-muted-foreground shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-xs border font-medium ${tierBadge(seller.verification_tier)}`}>
                            {(seller.verification_tier || "verified").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Button variant="outline" className="w-full mt-6 gap-2 border-border" size="sm">
              View All Sellers
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-foreground">Featured Products</h3>
              <Link href="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Browse All →
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <Link key={product.id} href={`/marketplace/${product.id}`}>
                    <div className="p-5 bg-card border border-border rounded-lg hover:border-border">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground bg-card border border-border px-2 py-0.5 rounded">
                          {product.category || "Digital"}
                        </span>
                      </div>

                      <h4 className="font-display font-medium text-foreground mb-2 group-hover:text-foreground transition-colors">
                        {product.title}
                      </h4>

                      <div className="flex items-end gap-2 mb-3">
                        <span className="font-mono text-lg font-bold text-foreground">${product.price.toFixed(2)}</span>
                        {product.original_price && (
                          <span className="font-mono text-sm text-muted-foreground line-through">${product.original_price.toFixed(2)}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-xs text-muted-foreground">by {product.seller?.full_name || "Unknown"}</span>
                        <Button size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                          View
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}