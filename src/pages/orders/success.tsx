import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { CheckCircle, Package, Mail, ArrowRight, ShoppingBag, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OrderSummary {
  id: string;
  total_amount: number;
  created_at: string;
  product: { title: string } | null;
  seller: { full_name: string | null } | null;
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebrating, setCelebrating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setCelebrating(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchLatestOrder() {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("orders")
        .select("id, total_amount, created_at, product:product_id(title), seller:seller_id(full_name)")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setOrder(data as unknown as OrderSummary);
      }
      setLoading(false);
    }
    fetchLatestOrder();
  }, [user]);

  function shareOnTwitter() {
    if (!order) return;
    const url = encodeURIComponent(`https://tradevault.io/orders/${order.id}`);
    const text = encodeURIComponent(`Just bought ${order.product?.title || "digital goods"} on TradeVault with escrow protection!`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
  }

  if (celebrating) {
    return (
      <>
        <SEO title="Payment Successful! — TradeVault" description="Your order has been placed successfully." />
        <div className="container px-4 sm:px-6 py-16 md:py-24 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative h-20 w-20 bg-primary rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground text-center max-w-md">
            Your order is being processed with escrow protection.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Order Confirmed — TradeVault" description="Your order has been placed successfully with escrow protection." />
      <div className="container px-4 sm:px-6 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 bg-success/10 rounded-full items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">Thank you for your purchase. Your order is protected by escrow.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : order ? (
            <div className="bg-card border border-border rounded-lg p-5 md:p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center shrink-0">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-mono text-sm text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                  <h3 className="font-medium text-foreground">{order.product?.title || "Digital Goods"}</h3>
                  <p className="text-sm text-muted-foreground">Sold by {order.seller?.full_name || "TradeVault Seller"}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-mono font-semibold text-foreground">${order.total_amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">A confirmation email has been sent to your inbox.</span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="bg-card border border-border rounded-lg p-5 md:p-6 mb-6">
            <h3 className="font-display font-semibold text-foreground mb-4">What&apos;s Next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Seller prepares your order</p>
                  <p className="text-xs text-muted-foreground">The seller will deliver your digital goods within the specified timeframe.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">You receive your goods</p>
                  <p className="text-xs text-muted-foreground">Check your order page or email for delivery details.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Confirm delivery</p>
                  <p className="text-xs text-muted-foreground">Once satisfied, confirm delivery to release funds from escrow to the seller.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/orders" className="flex-1">
              <Button variant="outline" className="w-full gap-2 border-border">
                <ShoppingBag className="h-4 w-4" />
                View My Orders
              </Button>
            </Link>
            <Link href="/marketplace" className="flex-1">
              <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" onClick={shareOnTwitter} className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}