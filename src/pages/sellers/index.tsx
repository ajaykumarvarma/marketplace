import Link from "next/link";
import { Star, Shield, TrendingUp, ShoppingCart, Award, ArrowRight, Store, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

const sellers = [
  {
    id: "seller-1",
    name: "GameVault",
    tagline: "Your trusted source for Steam keys and bundles",
    rating: 4.9,
    sales: 2847,
    since: "2023",
    verified: true,
    badge: "Top Seller",
    products: 142,
    responseTime: "< 5 min",
    categories: ["Game Keys", "Subscriptions"],
  },
  {
    id: "seller-2",
    name: "SubMaster",
    tagline: "Premium subscriptions at unbeatable prices",
    rating: 4.8,
    sales: 1523,
    since: "2024",
    verified: true,
    badge: "Rising Star",
    products: 56,
    responseTime: "< 10 min",
    categories: ["Subscriptions", "Gift Cards"],
  },
  {
    id: "seller-3",
    name: "LicenseHub",
    tagline: "Genuine software licenses with full warranty",
    rating: 4.7,
    sales: 892,
    since: "2023",
    verified: true,
    badge: null,
    products: 89,
    responseTime: "< 15 min",
    categories: ["Software"],
  },
  {
    id: "seller-4",
    name: "GiftGenie",
    tagline: "Digital gifts delivered instantly worldwide",
    rating: 4.9,
    sales: 3421,
    since: "2022",
    verified: true,
    badge: "Elite",
    products: 234,
    responseTime: "< 2 min",
    categories: ["Gift Cards", "Subscriptions"],
  },
  {
    id: "seller-5",
    name: "EpicTrades",
    tagline: "Rare gaming accounts and collectibles",
    rating: 4.6,
    sales: 567,
    since: "2024",
    verified: false,
    badge: null,
    products: 45,
    responseTime: "< 30 min",
    categories: ["Accounts"],
  },
  {
    id: "seller-6",
    name: "DesignDeals",
    tagline: "Creative tools for designers and artists",
    rating: 4.8,
    sales: 1234,
    since: "2023",
    verified: true,
    badge: "Top Rated",
    products: 67,
    responseTime: "< 8 min",
    categories: ["Software", "Digital Art"],
  },
];

export default function SellersPage() {
  return (
    <>
      <SEO title="Top Sellers — TradeVault" description="Discover trusted sellers on TradeVault. Verified merchants with escrow protection and buyer guarantees." />
      <div className="container py-8 md:py-12">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Top Sellers</h1>
          <p className="text-muted-foreground">Verified merchants with proven track records</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sellers.map((seller) => (
            <div
              key={seller.id}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-display text-lg font-semibold text-foreground">
                    {seller.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display font-semibold text-foreground">{seller.name}</h3>
                      {seller.verified && <BadgeCheck className="h-4 w-4 text-success" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{seller.tagline}</p>
                  </div>
                </div>
                {seller.badge && (
                  <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    {seller.badge}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div className="bg-muted rounded p-2">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <span className="font-mono text-sm font-semibold text-foreground">{seller.rating}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Rating</p>
                </div>
                <div className="bg-muted rounded p-2">
                  <span className="font-mono text-sm font-semibold text-foreground">{seller.sales.toLocaleString()}</span>
                  <p className="text-[10px] text-muted-foreground">Sales</p>
                </div>
                <div className="bg-muted rounded p-2">
                  <span className="font-mono text-sm font-semibold text-foreground">{seller.products}</span>
                  <p className="text-[10px] text-muted-foreground">Products</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {seller.categories.map((c) => (
                  <Badge key={c} variant="outline" className="border-border text-[10px] text-muted-foreground">
                    {c}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border mb-4">
                <span>Since {seller.since}</span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  {seller.responseTime}
                </span>
              </div>

              <Link href={`/marketplace?seller=${seller.id}`}>
                <span className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20">
                  <Store className="h-4 w-4" />
                  View Store
                </span>
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-8 text-center mt-8">
          <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-2">Want to become a seller?</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Join thousands of verified sellers. Get access to fraud-protected transactions and instant payouts.
          </p>
          <Link href="/sell">
            <span className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              Start Selling <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}