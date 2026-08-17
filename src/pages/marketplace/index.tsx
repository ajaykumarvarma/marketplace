import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, Star, ArrowUpDown, Loader2, Shield, Clock, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { SearchFilters } from "@/components/marketplace/SearchFilters";

interface Product {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  category_id: string;
  image_url: string | null;
  delivery_time: string;
  stock: number;
  status: string;
  created_at: string;
  seller: { full_name: string | null; role: string } | null;
  category: { name: string; slug: string } | null;
}

function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4">
        <div className="h-4 bg-muted rounded w-3/4 mb-3" />
        <div className="h-3 bg-muted rounded w-1/2 mb-3" />
        <div className="h-5 bg-muted rounded w-1/3 mb-3" />
        <div className="h-8 bg-muted rounded w-full" />
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price_low" | "price_high" | "newest">("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from("categories").select("id, name").order("name"),
        supabase
          .from("products")
          .select("*, seller:seller_id(full_name, role), category:category_id(name, slug)")
          .eq("status", "active")
          .order("created_at", { ascending: false }),
      ]);
      if (cats) setCategories([{ id: "all", name: "All" }, ...cats]);
      if (prods) setProducts(prods as Product[]);
      setLoading(false);
    }
    loadData();
  }, []);

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category?.name === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.seller?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "price_low": return a.price - b.price;
      case "price_high": return b.price - a.price;
      case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default: return 0;
    }
  });

  return (
    <>
      <SEO
        title="Marketplace — TradeVault"
        description="Browse thousands of digital goods. Game keys, accounts, software, subscriptions, and more with escrow protection."
        image="https://tradevault.io/og-image.png"
        url="https://tradevault.io/marketplace"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "TradeVault Marketplace",
          url: "https://tradevault.io/marketplace",
          description: "Browse thousands of verified digital goods from trusted sellers.",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://tradevault.io/marketplace?q={search_term}",
            "query-input": "required name=search_term"
          }
        }}
      />
      <div className="container py-8 md:py-12 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Marketplace</h1>
          <p className="text-muted-foreground">Browse verified digital goods from trusted sellers</p>
        </div>

        <SearchFilters
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={(val) => setSortBy(val as typeof sortBy)}
          onPriceChange={setPriceRange}
          resultCount={sorted.length}
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((product) => (
              <div key={product.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <Link href={`/marketplace/${product.id}`}>
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    <Image
                      src={product.image_url || "/generated/hero-product.png"}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                    {product.stock < 10 && (
                      <Badge className="absolute top-3 left-3 bg-muted text-foreground border-border text-xs z-10">
                        Low Stock
                      </Badge>
                    )}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-background px-2 py-1 rounded text-xs font-mono text-foreground z-10">
                      <Clock className="h-3 w-3" />
                      {product.delivery_time}
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/marketplace/${product.id}`}>
                    <h3 className="font-medium text-foreground hover:text-foreground line-clamp-1 mb-2">{product.title}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground">
                      {product.seller?.full_name?.[0]?.toUpperCase() || "S"}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{product.seller?.full_name || "Unknown Seller"}</span>
                    {product.seller?.role === "seller" && (
                      <Badge variant="outline" className="text-xs h-4 px-1 bg-muted text-foreground border-border">
                        <Shield className="h-2.5 w-2.5 mr-0.5" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-lg font-semibold text-foreground">${product.price.toFixed(2)}</span>
                    {product.original_price && (
                      <span className="text-sm text-muted-foreground line-through">${product.original_price.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">{product.category?.name || "Other"}</span>
                    <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">{product.delivery_time}</span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full gap-2 bg-muted hover:bg-muted text-foreground border border-border"
                    onClick={(e) => {
                      e.preventDefault();
                      addItem({ id: product.id, title: product.title, price: product.price, seller: product.seller?.full_name || "Unknown" });
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <Search className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="font-display text-lg font-medium text-foreground">No products found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </>
  );
}