import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Shield, Clock, ArrowLeft, ShoppingCart, MessageSquare, Flag, CheckCircle, Send, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createNotification } from "@/services/notificationService";
import { WishlistButton } from "@/components/WishlistButton";

interface ProductDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  delivery_time: string;
  stock: number;
  tags: string[];
  status: string;
  created_at: string;
  seller: { id: string; full_name: string | null; role: string } | null;
  category: { name: string } | null;
  reviews: { id: string; reviewer_id: string; rating: number; comment: string; created_at: string; helpful_count: number; unhelpful_count: number; approved: boolean }[] | null;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewVotes, setReviewVotes] = useState<Record<string, "up" | "down" | null>>({});
  const [voteLoading, setVoteLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*, seller:seller_id(id, full_name, role), category:category_id(name), reviews(*)")
        .eq("id", id as string)
        .maybeSingle();
      if (data) setProduct(data as ProductDetail);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <>
        <SEO title="Product — TradeVault" description="Browse digital goods on TradeVault." />
        <div className="container py-12">
          <div className="max-w-6xl mx-auto">
            <div className="h-8 bg-muted rounded w-1/4 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="aspect-[16/9] bg-muted rounded-lg mb-4" />
                <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-1/2 mb-3" />
                <div className="h-32 bg-muted rounded-lg" />
              </div>
              <div>
                <div className="bg-muted rounded-lg h-64" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

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

  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : "0.0";

  async function handleVote(reviewId: string, voteType: "up" | "down") {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to vote on reviews.", variant: "destructive" });
      return;
    }

    const currentVote = reviewVotes[reviewId];
    const isRemoving = currentVote === voteType;

    setVoteLoading(reviewId);
    try {
      const res = await fetch("/api/reviews/vote", {
        method: isRemoving ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          userId: user.id,
          voteType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Vote failed", description: data.error, variant: "destructive" });
      } else {
        setReviewVotes((prev) => ({
          ...prev,
          [reviewId]: isRemoving ? null : voteType,
        }));
        // Refresh product to get updated counts
        const { data: refreshed } = await supabase
          .from("products")
          .select("*, seller:seller_id(id, full_name, role), category:category_id(name), reviews(*)")
          .eq("id", id as string)
          .maybeSingle();
        if (refreshed) setProduct(refreshed as ProductDetail);
      }
    } catch {
      toast({ title: "Vote failed", description: "Please try again.", variant: "destructive" });
    }
    setVoteLoading(null);
  }

  async function submitReview() {
    if (!user || !product) return;
    if (!reviewText.trim()) {
      toast({ title: "Review required", description: "Please write a review comment.", variant: "destructive" });
      return;
    }

    const { data: orderData } = await supabase
      .from("orders")
      .select("id, seller_id")
      .eq("buyer_id", user.id)
      .eq("product_id", product.id)
      .eq("status", "completed")
      .maybeSingle();

    if (!orderData) {
      toast({ title: "Purchase required", description: "You must purchase and complete this product before leaving a review.", variant: "destructive" });
      return;
    }

    setSubmittingReview(true);
    const { error } = await supabase.from("reviews").insert({
      order_id: orderData.id,
      product_id: product.id,
      reviewer_id: user.id,
      seller_id: orderData.seller_id,
      rating: reviewRating,
      comment: reviewText.trim(),
    });

    setSubmittingReview(false);
    if (error) {
      toast({ title: "Error submitting review", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      setReviewText("");
      setReviewRating(5);
      const { data } = await supabase
        .from("products")
        .select("*, seller:seller_id(id, full_name, role), category:category_id(name), reviews(*)")
        .eq("id", id as string)
        .maybeSingle();
      if (data) setProduct(data as ProductDetail);

      // Notify seller
      if (orderData) {
        await createNotification(
          orderData.seller_id,
          "order",
          "New Review Received",
          `You received a ${reviewRating}-star review for your product.`,
          { orderId: orderData.id, rating: reviewRating }
        );
      }
    }
  }

  return (
    <>
      <SEO
        title={`${product.title} — TradeVault`}
        description={product.description.slice(0, 155)}
        image={product.image_url || "https://tradevault.io/og-image.png"}
        url={`https://tradevault.io/marketplace/${product.id}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          image: product.image_url || "https://tradevault.io/og-image.png",
          description: product.description.slice(0, 255),
          sku: product.id,
          brand: {
            "@type": "Brand",
            name: product.seller?.full_name || "TradeVault Seller"
          },
          offers: {
            "@type": "Offer",
            url: `https://tradevault.io/marketplace/${product.id}`,
            priceCurrency: "USD",
            price: product.price.toString(),
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            seller: {
              "@type": "Person",
              name: product.seller?.full_name || "Unknown"
            }
          },
          aggregateRating: product.reviews && product.reviews.length > 0 ? {
            "@type": "AggregateRating",
            ratingValue: avgRating,
            reviewCount: product.reviews.length.toString()
          } : undefined
        }}
      />
      <div className="container py-8 md:py-12">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="aspect-[16/9] bg-muted rounded-lg relative overflow-hidden mb-6">
              <Image
                src={product.image_url || "/generated/hero-product.png"}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-border text-muted-foreground">{product.category?.name || "Other"}</Badge>
                {product.seller?.role !== "buyer" && (
                  <Badge className="bg-muted text-foreground border-border">
                    <Shield className="h-3 w-3 mr-1" /> Verified Seller
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{product.title}</h1>
            </div>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="bg-muted border border-border">
                <TabsTrigger value="description" className="data-[state=active]:bg-card">Description</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-card">Reviews ({product.reviews?.length || 0})</TabsTrigger>
                <TabsTrigger value="delivery" className="data-[state=active]:bg-card">Delivery Info</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <p className="text-muted-foreground mb-4">{product.description}</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="mt-4">
                {user && (
                  <div className="bg-card border border-border rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-foreground mb-3">Write a Review</h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setReviewRating(star)} className="p-0.5">
                          <Star className={`h-5 w-5 ${star <= reviewRating ? "fill-foreground text-foreground" : "text-muted"}`} />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience with this product..."
                      className="bg-muted border-border min-h-[80px] mb-3"
                    />
                    <Button
                      onClick={submitReview}
                      disabled={submittingReview}
                      size="sm"
                      className="gap-2 bg-primary hover:bg-primary/90 mb-2"
                    >
                      <Send className="h-4 w-4" />
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                    <p className="text-xs text-muted-foreground">You can only review products you have purchased and received.</p>
                  </div>
                )}
                {product.reviews?.filter((r) => r.approved !== false).map((review) => {
                  const reviewId = review.id;
                  const helpfulCount = review.helpful_count || 0;
                  const unhelpfulCount = review.unhelpful_count || 0;
                  const reviewRating = review.rating || 0;
                  const userVote = reviewVotes[reviewId];
                  return (
                    <div key={reviewId} className="bg-card border border-border rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">
                            {review.reviewer_id?.[0]?.toUpperCase() || "U"}
                          </div>
                          <span className="font-medium text-foreground">Buyer</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} className={`h-4 w-4 ${j < reviewRating ? "fill-foreground text-foreground" : "text-muted"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>
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
                {(!product.reviews || product.reviews.length === 0) && (
                  <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review!</p>
                )}
              </TabsContent>
              <TabsContent value="delivery" className="mt-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Estimated Delivery</p>
                      <p className="text-sm text-muted-foreground">{product.delivery_time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Escrow Protection</p>
                      <p className="text-sm text-muted-foreground">Your payment is held securely until delivery is confirmed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Instant Access</p>
                      <p className="text-sm text-muted-foreground">Digital delivery — no shipping required</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <div className="bg-card border border-border rounded-lg p-6 sm:sticky sm:top-24">
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-3xl font-bold text-foreground">${product.price.toFixed(2)}</span>
                  {product.original_price && (
                    <span className="text-lg text-muted-foreground line-through">${product.original_price.toFixed(2)}</span>
                  )}
                </div>
                {product.original_price && (
                  <Badge className="mt-2 bg-muted text-foreground border-border">
                    Save {Math.round((1 - product.price / product.original_price) * 100)}%
                  </Badge>
                )}
              </div>

              <div className="mb-6">
                <Button
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-12 mb-3"
                  onClick={() => addItem({ id: product.id, title: product.title, price: product.price, seller: product.seller?.full_name || "Unknown" })}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2 border-border h-12">
                    <MessageSquare className="h-4 w-4" />
                    Contact Seller
                  </Button>
                  <WishlistButton productId={product.id} />
                </div>
              </div>

              <div className="pt-4 border-t border-border mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">
                    {product.seller?.full_name?.[0]?.toUpperCase() || "S"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground">{product.seller?.full_name || "Unknown"}</span>
                      {product.seller?.role !== "buyer" && <Shield className="h-4 w-4 text-success" />}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-foreground text-foreground" />
                        <span>{avgRating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Stock</span>
                  <span className="font-mono text-foreground">{product.stock} left</span>
                </div>
                {product.stock <= 5 && product.stock > 0 && (
                  <p className="text-xs text-foreground mb-2">Only {product.stock} left — order soon!</p>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-foreground">{product.delivery_time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Protection</span>
                  <span className="text-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Escrow
                  </span>
                </div>
              </div>

              <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mt-4">
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