import { useRouter } from "next/router";
import Link from "next/link";
import { Star, Shield, Clock, ArrowLeft, ShoppingCart, MessageSquare, Flag, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";

const productData: Record<string, {
  title: string;
  seller: string;
  sellerRating: number;
  sellerSales: number;
  sellerSince: string;
  verified: boolean;
  price: number;
  originalPrice: number | null;
  category: string;
  description: string;
  tags: string[];
  delivery: string;
  stock: number;
  reviews: { user: string; rating: number; date: string; comment: string }[];
}> = {
  "prod-1": {
    title: "Steam Game Keys Bundle — 50+ Titles",
    seller: "GameVault",
    sellerRating: 4.9,
    sellerSales: 2847,
    sellerSince: "2023",
    verified: true,
    price: 12.99,
    originalPrice: 49.99,
    category: "Game Keys",
    description: "Get instant access to over 50 premium Steam game keys. All keys are region-free and ready for immediate activation. Includes indie gems, AAA titles, and hidden treasures. Full replacement guarantee if any key is invalid.",
    tags: ["Instant Delivery", "Global", "Replacement Guarantee"],
    delivery: "1 min",
    stock: 47,
    reviews: [
      { user: "AlexM", rating: 5, date: "2026-08-05", comment: "All keys worked perfectly. Great value for money!" },
      { user: "SarahK", rating: 5, date: "2026-08-03", comment: "Instant delivery as promised. Will buy again." },
      { user: "MikeR", rating: 4, date: "2026-07-28", comment: "One key had an issue but seller replaced it within 5 minutes." },
    ],
  },
  "prod-2": {
    title: "Spotify Premium 12-Month Subscription",
    seller: "SubMaster",
    sellerRating: 4.8,
    sellerSales: 1523,
    sellerSince: "2024",
    verified: true,
    price: 24.99,
    originalPrice: 99.99,
    category: "Subscriptions",
    description: "Spotify Premium for 12 months at a fraction of the cost. Full warranty throughout the subscription period. Works globally with any Spotify account.",
    tags: ["Instant", "Warranty", "Global"],
    delivery: "Instant",
    stock: 23,
    reviews: [
      { user: "JessicaT", rating: 5, date: "2026-08-08", comment: "Still working after 3 months. Excellent!" },
      { user: "DavidL", rating: 5, date: "2026-08-01", comment: "Best price I could find. Highly recommended." },
    ],
  },
};

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const product = productData[id as string];

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <h1 className="font-display text-xl font-medium text-foreground">Product not found</h1>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/marketplace")}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEO title={`${product.title} — TradeVault`} description={product.description.slice(0, 160)} />
      <div className="container py-8 md:py-12 space-y-8">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-[16/9] bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              {product.title.split(" ").slice(0, 3).join(" ")}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-border text-muted-foreground">{product.category}</Badge>
                {product.verified && (
                  <Badge className="bg-success/10 text-success border-success/20">
                    <Shield className="h-3 w-3 mr-1" /> Verified Seller
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{product.title}</h1>
            </div>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="bg-muted border border-border">
                <TabsTrigger value="description" className="data-[state=active]:bg-card">Description</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-card">Reviews ({product.reviews.length})</TabsTrigger>
                <TabsTrigger value="delivery" className="data-[state=active]:bg-card">Delivery Info</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4 space-y-4">
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="mt-4 space-y-4">
                {product.reviews.map((review, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">
                          {review.user[0]}
                        </div>
                        <span className="font-medium text-foreground">{review.user}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`h-3.5 w-3.5 ${j < review.rating ? "fill-warning text-warning" : "text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="delivery" className="mt-4 space-y-4">
                <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Estimated Delivery</p>
                      <p className="text-sm text-muted-foreground">{product.delivery}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium text-foreground">Escrow Protection</p>
                      <p className="text-sm text-muted-foreground">Your payment is held securely until delivery is confirmed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium text-foreground">Instant Access</p>
                      <p className="text-sm text-muted-foreground">Digital delivery — no shipping required</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6 sticky top-24">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-3xl font-bold text-foreground">${product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                {product.originalPrice && (
                  <Badge className="mt-2 bg-success/10 text-success border-success/20">
                    Save {Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-12">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
                <Button variant="outline" className="w-full gap-2 border-border hover:bg-muted h-12">
                  <MessageSquare className="h-4 w-4" />
                  Contact Seller
                </Button>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">
                    {product.seller[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground">{product.seller}</span>
                      {product.verified && <Shield className="h-3.5 w-3.5 text-success" />}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <span>{product.sellerRating}</span>
                      </div>
                      <span>· {product.sellerSales.toLocaleString()} sales</span>
                      <span>· Since {product.sellerSince}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Stock</span>
                  <span className="font-mono text-foreground">{product.stock} left</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-foreground">{product.delivery}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Protection</span>
                  <span className="text-success flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Escrow
                  </span>
                </div>
              </div>

              <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Flag className="h-3 w-3" />
                Report this listing
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}