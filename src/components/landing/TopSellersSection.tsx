import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Shield, ArrowRight, Loader2 } from "lucide-react";
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

  const fetchData = useCallback(async () => {
    const [sellersRes, productsRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, verification_tier, role").eq("role", "seller").order("created_at", { ascending: false }).limit(4),
      supabase.from("products").select("id, title, price, original_price, category, seller:seller_id(full_name, verification_tier)").eq("status", "active").order("created_at", { ascending: false }).limit(4),
    ]);

    if (sellersRes.data) setSellers(sellersRes.data as unknown as TopSeller[]);
    if (productsRes.data) setProducts(productsRes.data as unknown as FeaturedProduct[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tierBadge = (tier: string | null) => {
    switch (tier) {
      case "gold": return "bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-0 shadow-md";
      case "silver": return "bg-gradient-to-r from-slate-300 to-slate-400 text-black border-0 shadow-md";
      case "bronze": return "bg-gradient-to-r from-amber-600 to-orange-700 text-white border-0 shadow-md";
      default: return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <section className="py-16 md:py-24 border-y border-border bg-muted">
      <div className="container px-4 sm:px-6">
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
                    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/30 mb-3 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-primary flex items-center justify-center text-sm font-bold text-white shadow-md">
                        {(seller.full_name || "S")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground text-sm truncate">{seller.full_name || "Unnamed Seller"}</span>
                          <Shield className="h-3 w-3 text-emerald-400 shrink-0" />
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
                    <div className="p-5 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-mono uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {product.category || "Digital"}
                        </span>
                      </div>

                      <h4 className="font-display font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
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
                        <Button size="sm" className="h-8 text-xs bg-gradient-to-r from-primary to-blue-500 text-white hover:opacity-90 border-0 shadow-sm">
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