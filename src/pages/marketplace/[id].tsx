import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Shield, Clock, ArrowLeft, ShoppingCart, MessageSquare, Flag, CheckCircle, Send, ThumbsUp, ThumbsDown, Bell, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createNotification } from "@/services/notificationService";
import { WishlistButton } from "@/components/WishlistButton";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

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
  auto_delivery?: boolean;
  seller: { id: string; full_name: string | null; role: string } | null;
  category: { name: string } | null;
  category_id: string | null;
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
  const [alertPrice, setAlertPrice] = useState("");
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertSet, setAlertSet] = useState(false);
  const [adding, setAdding] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [relatedProducts, setRelatedProducts] = useState<Array<{ id: string; title: string; price: number; image_url: string | null }>>([]);

  useEffect(() => {
    if (!id) return;
    async function fetchProduct() {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*, category:category_id(name, slug), seller:seller_id(id, full_name, role, avatar_url), reviews:reviews(id, reviewer_id, rating, comment, created_at, helpful_count, unhelpful_count, approved)")
        .eq("id", id as string)
        .maybeSingle();

      if (!data) {
        router.push("/404");
        setLoading(false);
        return;
      }

      const typed = data as unknown as {
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
        auto_delivery?: boolean;
        category_id: string | null;
        category: { name: string; slug: string } | null;
        seller: { id: string; full_name: string | null; role: string; avatar_url: string | null } | null;
        reviews: Array<{ id: string; reviewer_id: string; rating: number; comment: string; created_at: string; helpful_count: number; unhelpful_count: number; approved: boolean }> | null;
      };

      setProduct(typed);
      setLoading(false);

      // Track in recently viewed
      addToRecentlyViewed({
        id: typed.id,
        title: typed.title,
        price: typed.price,
        image_url: typed.image_url,
        category: typed.category?.name || null,
      });
    }
    fetchProduct();
  }, [id, addToRecentlyViewed]);

  useEffect(() => {
    if (!product?.category_id) return;
    async function fetchRelated() {
      const { data } = await supabase
        .from("products")
        .select("id, title, price, image_url")
        .eq("category_id", product.category_id)
        .neq("id", product.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(4);

      if (data) {
        setRelatedProducts(data as Array<{ id: string; title: string; price: number; image_url: string | null }>);
      }
    }
    fetchRelated();
  }, [product?.category_id, product?.id]);

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
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  const avgRatingDisplay = avgRating > 0 ? avgRating.toFixed(1) : "0.0";

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

  async function setPriceAlert() {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to set price alerts.", variant: "destructive" });
      return;
    }
    const target = parseFloat(alertPrice);
    if (isNaN(target) || target <= 0 || target >= product.price) {
      toast({ title: "Invalid price", description: "Target price must be lower than current price.", variant: "destructive" });
      return;
    }

    setAlertSubmitting(true);
    const { error } = await supabase.from("price_alerts").insert({
      user_id: user.id,
      product_id: product.id,
      target_price: target,
    });

    setAlertSubmitting(false);
    if (error) {
      toast({ title: "Failed to set alert", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Price alert set!", description: `We'll notify you when the price drops to $${target.toFixed(2)} or lower.` });
      setAlertSet(true);
      setAlertPrice("");
    }
  }

  function shareOnTwitter() {
    const url = encodeURIComponent(`https://tradevault.io/marketplace/${product?.id}`);
    const text = encodeURIComponent(`Check out ${product?.title} on TradeVault for $${product?.price.toFixed(2)}!`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
  }

  function shareOnFacebook() {
    const url = encodeURIComponent(`https://tradevault.io/marketplace/${product?.id}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  }

  function copyLink() {
    navigator.clipboard.writeText(`https://tradevault.io/marketplace/${product?.id}`);
    toast({ title: "Link copied!", description: "Product link copied to clipboard." });
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

  async function handleAddToCart() {
    if (!product) return;
    setAdding(true);
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      seller: product.seller?.full_name || "Unknown",
      sellerId: product.seller?.id || "",
    });
    toast({ title: "Added to cart", description: `${product.title} added to your cart.` });
    setAdding(false);
  }

  async function sendMessageToSeller() {
    if (!user || !product?.seller) {
      toast({ title: "Sign in required", description: "Please sign in to message the seller.", variant: "destructive" });
      return;
    }
    if (!chatMessage.trim()) return;

    setSendingChat(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: product.seller.id,
      content: chatMessage.trim(),
      product_id: product.id,
    });

    setSendingChat(false);
    if (error) {
      toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Message sent!", description: "The seller will be notified." });
      setChatMessage("");
      setChatOpen(false);

      // Notify seller
      await createNotification(
        product.seller.id,
        "message",
        "New Message",
        `You have a new message about ${product.title}.`,
        { productId: product.id }
      );
    }
  }

  return (
    <>
      <SEO
        title={`${product.title} — TradeVault Marketplace`}
        description={`${product.description?.slice(0, 150)}... Buy ${product.title} for $${product.price.toFixed(2)} with escrow protection.`}
        image={product.image_url || "https://tradevault.io/og-image.png"}
        url={`https://tradevault.io/marketplace/${product.id}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.description,
          image: product.image_url || "https://tradevault.io/og-image.png",
          offers: {
            "@type": "Offer",
            price: product.price.toFixed(2),
            priceCurrency: "USD",
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            seller: {
              "@type": "Person",
              name: product.seller?.full_name || "TradeVault Seller",
            },
          },
          aggregateRating: avgRating > 0 ? {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: String(product.reviews?.length || 0),
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

              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {adding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4" />
                    )}
                    Add to Cart
                  </Button>
                  <WishlistButton productId={product.id} />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setChatOpen(true)}
                  className="gap-2 border-border"
                >
                  <MessageSquare className="h-4 w-4" />
                  Message Seller
                </Button>

                {!alertSet ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={alertPrice}
                      onChange={(e) => setAlertPrice(e.target.value)}
                      placeholder="Target price"
                      className="bg-muted border-border w-32"
                    />
                    <Button
                      variant="outline"
                      onClick={setPriceAlert}
                      disabled={alertSubmitting}
                      className="gap-2 border-border flex-1"
                    >
                      <Bell className="h-4 w-4" />
                      {alertSubmitting ? "Setting..." : "Price Alert"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Price alert set. We'll notify you when the price drops.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareOnTwitter}
                  className="flex-1 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Tweet
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareOnFacebook}
                  className="flex-1 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyLink}
                  className="flex-1 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Share2 className="h-4 w-4" />
                  Copy Link
                </Button>
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
                        <span>{avgRatingDisplay}</span>
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
                {product.auto_delivery === true && (
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary">
                      Instant Delivery
                    </Badge>
                    <span className="text-xs text-muted-foreground">Keys delivered instantly after payment</span>
                  </div>
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
        {relatedProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/marketplace/${rp.id}`}
                  className="bg-card border border-border rounded-lg overflow-hidden hover:border-foreground/30 transition-colors"
                >
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    <Image
                      src={rp.image_url || "/generated/hero-product.png"}
                      alt={rp.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground truncate">{rp.title}</p>
                    <p className="text-sm font-mono text-muted-foreground">${rp.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Message Seller</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Product: <span className="text-foreground font-medium">{product?.title}</span></p>
              <p className="text-sm text-muted-foreground">Seller: <span className="text-foreground">{product?.seller?.full_name || "Unknown"}</span></p>
            </div>
            <Textarea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask the seller a question about this product..."
              className="bg-muted border-border min-h-[100px]"
            />
            <div className="flex gap-3">
              <Button
                onClick={sendMessageToSeller}
                disabled={sendingChat || !chatMessage.trim()}
                className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {sendingChat ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Message
              </Button>
              <Button variant="outline" onClick={() => setChatOpen(false)} className="border-border">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}