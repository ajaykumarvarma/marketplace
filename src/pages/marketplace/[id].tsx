import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Shield, Clock, ArrowLeft, ShoppingCart, MessageSquare, Flag, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

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
  reviews: { buyer_id: string; rating: number; comment: string; created_at: string }[] | null;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

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
          <div className="animate-pulse max-w-6xl mx-auto space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="aspect-[16/9] bg-muted rounded-lg" />
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-32 bg-muted rounded-lg" />
              </div>
              <div className="space-y-4">
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
            <div className="aspect-[16/9] bg-muted rounded-lg relative overflow-hidden">
              <Image
                src={product.image_url || "/generated/hero-product.png"}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-border text-muted-foreground">{product.category?.name || "Other"}</Badge>
                {product.seller?.role !== "buyer" && (
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
                <TabsTrigger value="reviews" className="data-[state=active]:bg-card">Reviews ({product.reviews?.length || 0})</TabsTrigger>
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
                {product.reviews?.map((review, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">
                          {review.buyer_id[0]?.toUpperCase() || "U"}
                        </div>
                        <span className="font-medium text-foreground">Buyer</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`h-3.5 w-3.5 ${j < review.rating ? "fill-warning text-warning" : "text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
                {(!product.reviews || product.reviews.length === 0) && (
                  <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review!</p>
                )}
              </TabsContent>
              <TabsContent value="delivery" className="mt-4 space-y-4">
                <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Estimated Delivery</p>
                      <p className="text-sm text-muted-foreground">{product.delivery_time}</p>
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
            <div className="bg-card border border-border rounded-lg p-6 space-y-6 sm:sticky sm:top-24">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-3xl font-bold text-foreground">${product.price.toFixed(2)}</span>
                  {product.original_price && (
                    <span className="text-lg text-muted-foreground line-through">${product.original_price.toFixed(2)}</span>
                  )}
                </div>
                {product.original_price && (
                  <Badge className="mt-2 bg-success/10 text-success border-success/20">
                    Save {Math.round((1 - product.price / product.original_price) * 100)}%
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                  onClick={() => addItem({ id: product.id, title: product.title, price: product.price, seller: product.seller?.full_name || "Unknown" })}
                >
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
                    {product.seller?.full_name?.[0]?.toUpperCase() || "S"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground">{product.seller?.full_name || "Unknown"}</span>
                      {product.seller?.role !== "buyer" && <Shield className="h-3.5 w-3.5 text-success" />}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <span>{avgRating}</span>
                      </div>
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
                  <span className="text-foreground">{product.delivery_time}</span>
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