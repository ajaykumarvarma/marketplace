import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Shield, Store, Package, Users, TrendingUp, MessageSquare, Flag, Loader2, Calendar, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SellerProfile {
  id: string;
  full_name: string | null;
  verification_tier: string;
  avatar_url: string | null;
  created_at: string;
}

interface SellerProduct {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  stock: number;
  status: string;
  category_id: string;
  category: { name: string } | null;
}

interface SellerReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name: string;
  product_title: string;
}

interface SellerStats {
  productCount: number;
  totalSales: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  responseTime: string;
}

export default function SellerProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [reviewVotes, setReviewVotes] = useState<Record<string, "up" | "down" | null>>({});
  const [voteLoading, setVoteLoading] = useState<string | null>(null);
  const { user } = useAuth();

  async function handleVote(reviewId: string, voteType: "up" | "down") {
    try {
      const res = await fetch("/api/reviews/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, voteType }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewVotes((prev) => ({ ...prev, [reviewId]: data.user_vote }));
        // Refresh counts
        const updated = reviews.map((r) =>
          r.id === reviewId ? { ...r, helpful_count: data.helpful_count, unhelpful_count: data.unhelpful_count } : r
        );
        setReviews(updated);
      }
    } catch {
      // silent fail
    }
  }

  const fetchSellerData = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    const [sellerRes, productsRes, reviewsRes, ordersRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", id as string).maybeSingle(),
      supabase.from("products").select("*, category:category_id(name)").eq("seller_id", id as string).eq("status", "active").order("created_at", { ascending: false }),
      supabase.from("reviews").select("id, rating, comment, created_at, product:product_id(title), reviewer:reviewer_id(full_name)").eq("seller_id", id as string).order("created_at", { ascending: false }).limit(20),
      supabase.from("orders").select("total_amount, status").eq("seller_id", id as string),
    ]);

    if (sellerRes.data) {
      setSeller(sellerRes.data as SellerProfile);
    }

    if (productsRes.data) {
      setProducts(productsRes.data as unknown as SellerProduct[]);
    }

    if (reviewsRes.data) {
      const mapped = reviewsRes.data.map((r: unknown) => {
        const row = r as Record<string, unknown>;
        return {
          id: String(row.id),
          rating: Number(row.rating),
          comment: String(row.comment),
          created_at: String(row.created_at),
          reviewer_name: ((row.reviewer as Record<string, unknown>)?.full_name as string) || "Anonymous",
          product_title: ((row.product as Record<string, unknown>)?.title as string) || "Product",
        };
      });
      setReviews(mapped);
    }

    // Calculate real stats
    const completedOrders = (ordersRes.data || []).filter((o: { status: string }) => o.status === "completed");
    const totalSales = completedOrders.length;
    const totalRevenue = completedOrders.reduce((sum: number, o: { total_amount: number | null }) => sum + (o.total_amount || 0), 0);
    const avgRating = reviewsRes.data && reviewsRes.data.length > 0
      ? (reviewsRes.data as unknown as { rating: number }[]).reduce((s, r) => s + r.rating, 0) / reviewsRes.data.length
      : 0;

    setStats({
      productCount: productsRes.data?.length || 0,
      totalSales,
      totalRevenue,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviewsRes.data?.length || 0,
      responseTime: "< 1 hour",
    });

    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchSellerData();
  }, [id, fetchSellerData]);

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
        <p className="text-muted-foreground mt-4">Loading seller profile...</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="container py-16 text-center">
        <h1 className="font-display text-xl font-medium text-foreground">Seller not found</h1>
      </div>
    );
  }

  const tierConfig: Record<string, { color: string; label: string }> = {
    bronze: { color: "bg-muted text-foreground border-border", label: "Bronze Seller" },
    silver: { color: "bg-muted text-foreground border-border", label: "Silver Seller" },
    gold: { color: "bg-muted text-foreground border-border", label: "Gold Seller" },
    verified: { color: "bg-muted text-foreground border-border", label: "Verified" },
  };

  const tier = tierConfig[seller.verification_tier] || tierConfig.bronze;

  return (
    <>
      <SEO title={`${seller.full_name || "Seller"} — TradeVault`} description={`Browse products from ${seller.full_name || "this seller"} on TradeVault. ${stats?.totalSales || 0} sales, ${stats?.rating || 0} rating.`} />
      <div className="container py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Seller Header */}
          <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-foreground">
                {seller.full_name?.[0]?.toUpperCase() || "S"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="font-display text-2xl font-bold text-foreground">{seller.full_name || "Seller"}</h1>
                  <Badge variant="outline" className={`${tier.color}`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {tier.label}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-muted-foreground fill-muted-foreground" />
                    <span className="text-foreground font-medium">{stats?.rating || 0}</span>
                    <span className="text-muted-foreground">({stats?.reviewCount || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{stats?.productCount || 0}</span>
                    <span className="text-muted-foreground">products</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{stats?.totalSales || 0}</span>
                    <span className="text-muted-foreground">sales</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Since {new Date(seller.created_at).getFullYear()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2 border-border">
                  <MessageSquare className="h-4 w-4" />
                  Contact
                </Button>
                <Button variant="outline" className="gap-2 border-border">
                  <Flag className="h-4 w-4" />
                  Report
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Package, label: "Products", value: stats?.productCount || 0 },
              { icon: Users, label: "Sales", value: stats?.totalSales || 0 },
              { icon: Star, label: "Rating", value: stats?.rating || 0 },
              { icon: TrendingUp, label: "Revenue", value: `$${(stats?.totalRevenue || 0).toFixed(0)}` },
            ].map((stat, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 text-center">
                <stat.icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="font-mono text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted border-border">
              <TabsTrigger value="products" className="gap-2">
                <Store className="h-4 w-4" />
                Products ({products.length})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2">
                <Star className="h-4 w-4" />
                Reviews ({reviews.length})
              </TabsTrigger>
              <TabsTrigger value="about" className="gap-2">
                <Shield className="h-4 w-4" />
                About
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              {products.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No products listed yet</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Link key={product.id} href={`/marketplace/${product.id}`}>
                      <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-foreground transition-colors">
                        <div className="aspect-[4/3] bg-muted relative">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <Package className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-foreground line-clamp-2 mb-2">{product.title}</h3>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-mono font-bold text-foreground">${product.price.toFixed(2)}</span>
                              {product.original_price && (
                                <span className="text-sm text-muted-foreground line-through ml-2">${product.original_price.toFixed(2)}</span>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs border-border">
                              {product.stock} left
                            </Badge>
                          </div>
                          {product.category?.name && (
                            <p className="text-xs text-muted-foreground mt-2">{product.category.name}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              {reviews.filter((r) => (r as unknown as Record<string, unknown>).approved !== false).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No reviews yet</div>
              ) : (
                <div className="space-y-4">
                  {reviews.filter((r) => (r as unknown as Record<string, unknown>).approved !== false).map((review) => {
                    const reviewId = review.id;
                    const helpfulCount = (review as unknown as Record<string, unknown>).helpful_count as number || 0;
                    const unhelpfulCount = (review as unknown as Record<string, unknown>).unhelpful_count as number || 0;
                    const userVote = reviewVotes[reviewId];
                    return (
                      <div key={review.id} className="bg-card border border-border rounded-lg p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">
                              {review.reviewer_name[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{review.reviewer_name}</p>
                              <p className="text-xs text-muted-foreground">{review.product_title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "fill-foreground text-foreground" : "text-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-foreground mb-3">{review.comment}</p>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleVote(reviewId, "up")}
                            disabled={voteLoading === reviewId}
                            className={`flex items-center gap-1.5 text-xs ${userVote === "up" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            Helpful ({helpfulCount})
                          </button>
                          <button
                            onClick={() => handleVote(reviewId, "down")}
                            disabled={voteLoading === reviewId}
                            className={`flex items-center gap-1.5 text-xs ${userVote === "down" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                            Not helpful ({unhelpfulCount})
                          </button>
                          <span className="text-xs text-muted-foreground ml-auto">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-display font-semibold text-foreground mb-3">About this Seller</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">Identity verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">Active seller</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{stats?.productCount || 0} products listed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{stats?.totalSales || 0} completed sales</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">This seller has been a member of TradeVault since {new Date(seller.created_at).toLocaleDateString()}.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}