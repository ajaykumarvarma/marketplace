import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ArrowRight, Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  product: { title: string } | null;
  seller: { full_name: string | null } | null;
}

const statusConfig: Record<string, { icon: typeof Package; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-warning", label: "Awaiting Delivery" },
  shipped: { icon: Package, color: "text-primary", label: "In Transit" },
  delivered: { icon: CheckCircle, color: "text-success", label: "Delivered" },
  cancelled: { icon: AlertTriangle, color: "text-destructive", label: "Cancelled" },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="container py-8 md:py-12 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground">Track deliveries and manage your purchases</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-5 animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const Icon = config.icon;
              return (
                <div key={order.id} className="bg-card border border-border rounded-lg p-5 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center shrink-0">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">{order.id.slice(0, 8).toUpperCase()}</span>
                          <Badge variant="outline" className={`text-xs ${order.status === "delivered" ? "bg-success/10 text-success border-success/20" : order.status === "cancelled" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-warning/10 text-warning border-warning/20"}`}>
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
                        <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary/80">
                          Details
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {order.status === "pending" && (
                    <div className="bg-muted/50 rounded-md p-3 flex items-start gap-3 text-sm">
                      <Shield className="h-4 w-4 text-success shrink-0 mt-0.5" />
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
          <div className="text-center py-16 space-y-4">
            <Package className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="font-display text-lg font-medium text-foreground">No orders yet</h3>
            <Link href="/marketplace">
              <Button className="mt-4 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
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