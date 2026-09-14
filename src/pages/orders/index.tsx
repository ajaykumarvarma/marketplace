import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Package, ArrowRight, Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  product: { title: string } | null;
  seller: { full_name: string | null } | null;
}

const statusConfig: Record<string, { icon: typeof Package; color: string; label: string; bg: string }> = {
  pending: { icon: Clock, color: "text-amber-400", label: "Awaiting Delivery", bg: "bg-amber-500/10 border-amber-500/20" },
  shipped: { icon: Package, color: "text-blue-400", label: "In Transit", bg: "bg-blue-500/10 border-blue-500/20" },
  delivered: { icon: CheckCircle, color: "text-emerald-400", label: "Delivered", bg: "bg-emerald-500/10 border-emerald-500/20" },
  cancelled: { icon: AlertTriangle, color: "text-red-400", label: "Cancelled", bg: "bg-red-500/10 border-red-500/20" },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (router.query.success === "1") {
      toast({
        title: "Payment successful!",
        description: "Your order has been placed and is being processed.",
      });
      // Clean up URL
      router.replace("/orders", undefined, { shallow: true });
    }
  }, [router.query.success, toast, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("orders")
        .select("id, status, total_amount, created_at, product:product_id(title), seller:seller_id(full_name)")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setOrders(data as unknown as Order[]);
      setLoading(false);
    }
    load();
  }, [user]);

  return (
    <>
      <SEO title="My Orders — TradeVault" description="Track your orders and delivery status." />
      <div className="container py-8 md:py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground">Track deliveries and manage your purchases</p>
        </div>

        {loading ? (
          <div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-5 mb-4">
                <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {orders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const Icon = config.icon;
              return (
                <div key={order.id} className="bg-card border border-border rounded-lg p-5 mb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-md flex items-center justify-center shrink-0">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">{order.id.slice(0, 8).toUpperCase()}</span>
                          <Badge variant="outline" className={`text-xs ${config.bg} ${config.color}`}>
                            <Icon className={`h-3 w-3 mr-1 ${config.color}`} />
                            {config.label}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-foreground mt-1">{order.product?.title || "Unknown Product"}</h3>
                        <p className="text-sm text-muted-foreground">Sold by {order.seller?.full_name || "Unknown"} · {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-foreground">${order.total_amount.toFixed(2)}</span>
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary hover:bg-primary/10">
                          Details
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {order.status === "pending" && (
                    <div className="bg-primary/5 border border-primary/20 rounded-md p-3 flex items-start gap-3 text-sm">
                      <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-foreground font-medium">Escrow Protection Active</p>
                        <p className="text-muted-foreground">Your payment is held securely. Confirm delivery once you receive your digital goods to release funds to the seller.</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display text-lg font-medium text-foreground mb-4">No orders yet</h3>
            <Link href="/marketplace">
              <Button className="gap-2 bg-gradient-to-r from-primary to-blue-500 text-white hover:opacity-90 shadow-lg shadow-primary/25">
                Browse Marketplace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}