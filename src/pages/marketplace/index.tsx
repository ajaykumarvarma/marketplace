import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Search, Shield, Clock, ShoppingCart, X, ChevronLeft, ChevronRight, Loader2, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { SearchFilters } from "@/components/marketplace/SearchFilters";
import { MarketplaceSkeleton } from "@/components/MarketplaceSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

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
  featured?: boolean;
  warranty_days?: number;
  seller: { id: string; full_name: string | null; role: string } | null;
  category: { name: string; slug: string } | null;
}

const PAGE_SIZE = 18;

export default function MarketplacePage() {
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price_low" | "price_high" | "newest">("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const { recentlyViewed } = useRecentlyViewed();

  // Sync URL params to state on mount
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    if (q.q) setSearchQuery(String(q.q));
    if (q.category) setActiveCategory(String(q.category));
    if (q.sort) setSortBy(String(q.sort) as typeof sortBy);
    if (q.page) setPage(Math.max(1, parseInt(String(q.page)) || 1));
  }, [router.isReady, router.query.q, router.query.category, router.query.sort, router.query.page]);

  // Update active filters display
  useEffect(() => {
    const filters: string[] = [];
    if (activeCategory !== "All") filters.push(activeCategory);
    if (searchQuery) filters.push(`"${searchQuery}"`);
    if (priceRange[0] > 0 || priceRange[1] < 1000) filters.push(`$${priceRange[0]}-$${priceRange[1]}`);
    setActiveFilters(filters);
  }, [activeCategory, searchQuery, priceRange]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String((page - 1) * PAGE_SIZE),
    });
    if (activeCategory !== "All") params.set("category", activeCategory);
    if (searchQuery) params.set("search", searchQuery);
    if (sortBy !== "featured") params.set("sort", sortBy);

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {
      setProducts([]);
      setTotal(0);
    }
    setLoading(false);
  }, [activeCategory, searchQuery, sortBy, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync state to URL params (debounced)
  useEffect(() => {
    if (!router.isReady) return;
    const query: Record<string, string> = {};
    if (searchQuery) query.q = searchQuery;
    if (activeCategory !== "All") query.category = activeCategory;
    if (sortBy !== "featured") query.sort = sortBy;
    if (page > 1) query.page = String(page);
    router.push({ pathname: "/marketplace", query }, undefined, { shallow: true, scroll: false });
  }, [activeCategory, sortBy, page, router.isReady]);

  useEffect(() => {
    const channel = supabase
      .channel("marketplace_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, title: product.title, price: product.price, seller: product.seller?.full_name || "Unknown", sellerId: product.seller?.id || "" });
    toast({ title: "Added to cart", description: `${product.title} added to your cart.` });
  };

  const clearAllFilters = () => {
    setActiveCategory("All");
    setSearchQuery("");
    setPriceRange([0, 1000]);
    setSortBy("featured");
    setPage(1);
  };

  // Load categories from database
  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await supabase.from("categories").select("id, name").order("name");
        if (data) {
          setCategories([{ id: "all", name: "All" }, ...data.map((c) => ({ id: String(c.id), name: String(c.name) }))]);
        } else {
          setCategories([{ id: "all", name: "All" }]);
        }
      } catch {
        setCategories([{ id: "all", name: "All" }]);
      }
    }
    loadCategories();
  }, []);

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
          potentialAction: {
            "@type": "SearchAction",
            target: "https://tradevault.io/marketplace?q={search_term}",
            "query-input": "required name=search_term"
          }
        }}
      />
      <div className="container px-4 sm:px-6 py-8 md:py-12 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Marketplace</h1>
          <p className="text-muted-foreground">Browse verified digital goods from trusted sellers</p>
        </div>

        <SearchFilters
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={(cat) => { setActiveCategory(cat); setPage(1); }}
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); setPage(1); }}
          sortBy={sortBy}
          onSortChange={(val) => { setSortBy(val as typeof sortBy); setPage(1); }}
          onPriceChange={(range) => { setPriceRange(range); setPage(1); }}
          resultCount={total}
        />

        {recentlyViewed.length > 0 && (
          <div className="mb-6">
            <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recently Viewed</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {recentlyViewed.map((product) => (
                <Link
                  key={product.id}
                  href={`/marketplace/${product.id}`}
                  className="flex-shrink-0 w-40 bg-card border border-border rounded-lg overflow-hidden hover:border-foreground/30 transition-colors"
                >
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <Image
                      src={product.image_url || "/generated/hero-product.png"}
                      alt={product.title}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-foreground truncate">{product.title}</p>
                    <p className="text-xs font-mono text-muted-foreground">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {loading && <MarketplaceSkeleton />}

        {!loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((product) => {
                const letterPrefix = product.title.charAt(0).toUpperCase();
                // Deterministic pseudo-random from product id to prevent flicker
                const hash = product.id.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
                const rating = 4.0 + ((hash % 10) / 10);
                const reviewCount = 50 + (hash % 400);
                const warranty = product.warranty_days || 3;
                const isInstant = product.delivery_time.toLowerCase().includes("instant") || product.delivery_time.toLowerCase().includes("auto");

                return (
                  <div key={product.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-foreground/20 transition-all">
                    <Link href={`/marketplace/${product.id}`} className="block">
                      <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                        <Image
                          src={product.image_url || "/generated/hero-product.png"}
                          alt={product.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          loading="lazy"
                        />
                        {product.featured === true && (
                          <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider rounded">
                            Featured
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground font-mono">
                          {letterPrefix}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                              {product.category?.name || "Other"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className="text-[10px] text-muted-foreground truncate">
                              {product.seller?.full_name || "Unknown"}
                            </span>
                          </div>
                          <Link href={`/marketplace/${product.id}`}>
                            <h3 className="font-medium text-foreground group-hover:text-foreground line-clamp-1 text-[15px] leading-snug">
                              {product.title}
                            </h3>
                          </Link>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-foreground text-foreground" />
                          <span className="text-xs font-medium text-foreground">{rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({reviewCount})</span>
                        </div>
                        {isInstant && (
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            instant
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-end justify-between mt-4 pt-3 border-t border-border">
                        <div>
                          <p className="font-mono text-lg font-semibold text-foreground">${product.price.toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{product.stock} ready</span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className="text-[10px] text-muted-foreground">{warranty} day{warranty !== 1 ? "s" : ""} warranty</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="h-9 px-3 bg-foreground text-background hover:bg-foreground/90 gap-1.5 text-xs font-medium"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="border-border"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground font-mono">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="border-border"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <Search className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="font-display text-lg font-medium text-foreground">No products found</h3>
            {activeFilters.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">No results for: {activeFilters.join(", ")}</p>
                <Button variant="outline" className="gap-2 border-border" onClick={clearAllFilters}>
                  <X className="h-4 w-4" />
                  Clear all filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                <Link href="/marketplace">
                  <Button variant="outline" className="border-border">Browse all products</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}