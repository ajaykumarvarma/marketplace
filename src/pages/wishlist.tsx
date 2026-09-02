import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WishlistItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    title: string;
    price: number;
    original_price: number | null;
    image_url: string | null;
    delivery_time: string;
    stock: number;
    status: string;
    seller_id?: string;
    seller: { full_name: string | null } | null;
    category: { name: string } | null;
  } | null;
}

export default function WishlistPage() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("wishlists")
      .select("id, product_id, product:product_id(id, title, price, original_price, image_url, delivery_time, stock, status, seller_id, seller:seller_id(full_name), category:category_id(name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setItems((data as unknown as WishlistItem[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchWishlist();
  }, [user, fetchWishlist]);

  async function removeItem(wishlistId: string) {
    const { error } = await supabase.from("wishlists").delete().eq("id", wishlistId);
    if (error) {
      toast({ title: "Failed to remove", variant: "destructive" });
    } else {
      setItems((prev) => prev.filter((i) => i.id !== wishlistId));
      toast({ title: "Removed from wishlist" });
    }
  }

  function moveToCart(product: WishlistItem["product"]) {
    if (!product) return;
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      seller: product.seller?.full_name || "Unknown",
      sellerId: product.seller_id || "",
    });
    toast({ title: "Added to cart", description: product.title });
  }

  if (!user) {
    return (
      <>
        <SEO title="Wishlist — TradeVault" />
        <div className="container py-16 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-xl font-medium text-foreground">Please sign in to view your wishlist</h1>
          <Link href="/auth/login?redirect=/wishlist">
            <Button className="mt-4">Sign In</Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Your Wishlist — TradeVault" />
      <div className="container py-8 md:py-12">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>

        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Your Wishlist</h1>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-16">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-medium text-foreground mb-2">Your wishlist is empty</h3>
            <p className="text-sm text-muted-foreground mb-4">Save products you&apos;re interested in for later</p>
            <Link href="/marketplace">
              <Button>Browse Marketplace</Button>
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;
              return (
                <div key={item.id} className="bg-card border border-border rounded-lg overflow-hidden">
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
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/marketplace/${product.id}`}>
                      <h3 className="font-medium text-foreground hover:text-foreground line-clamp-1 mb-2">{product.title}</h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mb-2">{product.seller?.full_name || "Unknown Seller"}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-lg font-semibold text-foreground">${product.price.toFixed(2)}</span>
                      {product.original_price && (
                        <span className="text-sm text-muted-foreground line-through">${product.original_price.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => moveToCart(product)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-muted-foreground hover:text-foreground"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}