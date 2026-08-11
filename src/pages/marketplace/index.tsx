import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Star, Shield, ArrowRight, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

const categories = [
  "All",
  "Game Keys",
  "Accounts",
  "Software",
  "Digital Art",
  "Services",
  "Gift Cards",
  "Subscriptions",
];

const products = [
  {
    id: "prod-1",
    title: "Steam Game Keys Bundle — 50+ Titles",
    seller: "GameVault",
    sellerRating: 4.9,
    sellerSales: 2847,
    verified: true,
    price: 12.99,
    originalPrice: 49.99,
    category: "Game Keys",
    image: "/generated/game-keys-bundle.png",
    tags: ["Instant Delivery", "Global"],
    delivery: "1 min",
    badge: "Best Seller",
  },
  {
    id: "prod-2",
    title: "Spotify Premium 12-Month Subscription",
    seller: "SubMaster",
    sellerRating: 4.8,
    sellerSales: 1523,
    verified: true,
    price: 24.99,
    originalPrice: 99.99,
    category: "Subscriptions",
    image: "/generated/spotify-sub.png",
    tags: ["Instant", "Warranty"],
    delivery: "Instant",
    badge: "Hot",
  },
  {
    id: "prod-3",
    title: "Adobe Creative Cloud Full Suite",
    seller: "LicenseHub",
    sellerRating: 4.7,
    sellerSales: 892,
    verified: true,
    price: 89.99,
    originalPrice: 599.99,
    category: "Software",
    image: "/generated/adobe-suite.png",
    tags: ["1-Year", "Global"],
    delivery: "5 min",
  },
  {
    id: "prod-4",
    title: "Discord Nitro 1-Year Gift",
    seller: "GiftGenie",
    sellerRating: 4.9,
    sellerSales: 3421,
    verified: true,
    price: 34.99,
    originalPrice: 99.99,
    category: "Gift Cards",
    image: "/generated/discord-nitro.png",
    tags: ["Instant", "Global"],
    delivery: "Instant",
    badge: "Top Rated",
  },
  {
    id: "prod-5",
    title: "Fortnite OG Account — 200+ Skins",
    seller: "EpicTrades",
    sellerRating: 4.6,
    sellerSales: 567,
    verified: false,
    price: 149.99,
    originalPrice: null,
    category: "Accounts",
    image: "/generated/fortnite-account.png",
    tags: ["Full Access", "Email Changeable"],
    delivery: "15 min",
  },
  {
    id: "prod-6",
    title: "Canva Pro Lifetime Access",
    seller: "DesignDeals",
    sellerRating: 4.8,
    sellerSales: 1234,
    verified: true,
    price: 19.99,
    originalPrice: 119.99,
    category: "Software",
    image: "/generated/canva-pro.png",
    tags: ["Lifetime", "Global"],
    delivery: "2 min",
  },
];

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.seller.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
          <Button variant="outline" className="gap-2 border-border hover:bg-muted">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Link key={product.id} href={`/marketplace/${product.id}`} className="group">
              <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-all hover:-translate-y-0.5">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                    {product.title.split(" ")[0]} {product.title.split(" ")[1]}
                  </div>
                  {product.badge && (
                    <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs">
                      {product.badge}
                    </Badge>
                  )}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-foreground">
                    <Clock className="h-3 w-3" />
                    {product.delivery}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{product.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">{product.seller}</span>
                      {product.verified && <Shield className="h-3 w-3 text-success" />}
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <span className="text-xs text-muted-foreground">{product.sellerRating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">({product.sellerSales.toLocaleString()})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-semibold text-foreground">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
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