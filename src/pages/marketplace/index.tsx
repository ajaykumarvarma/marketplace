import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Search, Shield, Clock, ShoppingCart, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { SearchFilters } from "@/components/marketplace/SearchFilters";
import { MarketplaceSkeleton } from "@/components/MarketplaceSkeleton";

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

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, title: product.title, price: product.price, seller: product.seller?.full_name || "Unknown" });
    toast({ title: "Added to cart", description: `${product.title} added to your cart.` });
  };

  const clearAllFilters = () => {
    setActiveCategory("All");
    setSearchQuery("");
    setPriceRange([0, 1000]);
    setSortBy("featured");
    setPage(1);
  };

  // Load categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/products?limit=1");
        // Actually fetch categories from a separate endpoint or extract from products
        // For now, use a simple fetch to get unique categories
        const catsRes = await fetch("/api/products?limit=100");
        const data = await catsRes.json();
        const uniqueCats = [...new Set((data.products || []).map((p: Product) => p.category?.name).filter(Boolean))];
        setCategories([{ id: "all", name: "All" }, ...uniqueCats.map((name) => ({ id: name as string, name: name as string }))]);
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
      <div className="container py-8 md:py-12 flex flex-col gap-6">
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

        {loading && <MarketplaceSkeleton />}

        {!loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
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
                        handleAddToCart(product);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
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