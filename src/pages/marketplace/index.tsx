import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, Star, Shield, ArrowRight, TrendingUp, Clock, ArrowUpDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  category_id: string;
  image_url: string | null;
  delivery_time: string;
  stock_quantity: number;
  status: string;
  created_at: string;
  seller: { full_name: string | null; role: string } | null;
  category: { name: string; slug: string } | null;
}

function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-5 bg-muted rounded w-1/3" />
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
    return matchesCategory && matchesSearch;
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
      <SEO title="Marketplace — TradeVault" description="Browse thousands of digital goods. Game keys, accounts, software, and more with escrow protection." />
      <div className="container py-8 md:py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground">Browse verified digital goods from trusted sellers</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, sellers, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted border-border"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="featured">Featured</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
            <Button variant="outline" className="gap-2 border-border hover:bg-muted">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((product) => (
              <div key={product.id} className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-all hover:-translate-y-0.5 group">
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
                    {product.stock_quantity < 10 && (
                      <Badge className="absolute top-3 left-3 bg-destructive/10 text-destructive border-destructive/20 text-xs z-10">
                        Low Stock
                      </Badge>
                    )}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-foreground z-10">
                      <Clock className="h-3 w-3" />
                      {product.delivery_time}
                    </div>
                  </div>
                </Link>
                <div className="p-4 space-y-3">
                  <Link href={`/marketplace/${product.id}`}>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{product.title}</h3>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{product.seller?.full_name || "Unknown"}</span>
                    {product.seller?.role !== "buyer" && <Shield className="h-3 w-3 text-success" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-semibold text-foreground">${product.price.toFixed(2)}</span>
                    {product.original_price && (
                      <span className="text-sm text-muted-foreground line-through">${product.original_price.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">{product.category?.name || "Other"}</span>
                    <span className="px-2 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">{product.delivery_time}</span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                    onClick={(e) => {
                      e.preventDefault();
                      addItem({ id: product.id, title: product.title, price: product.price, seller: product.seller?.full_name || "Unknown" });
                    }}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <Search className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="font-display text-lg font-medium text-foreground">No products found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </>
  );
}