import Link from "next/link";
import { Package, ArrowRight, Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

const orders = [
  { id: "ORD-7829", product: "Steam Game Keys Bundle", seller: "GameVault", amount: 12.99, status: "delivered", date: "2026-08-10", canReview: true },
  { id: "ORD-7828", product: "Spotify Premium 12M", seller: "SubMaster", amount: 24.99, status: "pending", date: "2026-08-11", canReview: false },
  { id: "ORD-7820", product: "Discord Nitro 1Y", seller: "GiftGenie", amount: 34.99, status: "delivered", date: "2026-08-05", canReview: true },
  { id: "ORD-7815", product: "Adobe Creative Cloud", seller: "LicenseHub", amount: 89.99, status: "dispute", date: "2026-08-01", canReview: false },
];

const statusConfig: Record<string, { icon: typeof Package; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-warning", label: "Awaiting Delivery" },
  delivered: { icon: CheckCircle, color: "text-success", label: "Delivered" },
  dispute: { icon: AlertTriangle, color: "text-destructive", label: "In Dispute" },
};

export default function OrdersPage() {
  return (
    <>
      <SEO title="My Orders — TradeVault" description="Track your orders and delivery status." />
      <div className="container py-8 md:py-12 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground">Track deliveries and manage your purchases</p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status];
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
                        <span className="font-mono text-sm text-muted-foreground">{order.id}</span>
                        <Badge variant="outline" className={`text-xs ${order.status === "delivered" ? "bg-success/10 text-success border-success/20" : order.status === "dispute" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-warning/10 text-warning border-warning/20"}`}>
                          <Icon className={`h-3 w-3 mr-1 ${config.color}`} />
                          {config.label}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-foreground mt-1">{order.product}</h3>
                      <p className="text-sm text-muted-foreground">Sold by {order.seller} · {order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-foreground">${order.amount.toFixed(2)}</span>
                    {order.status === "pending" && (
                      <Button size="sm" variant="outline" className="border-border hover:bg-muted gap-1">
                        <Shield className="h-3.5 w-3.5" />
                        Confirm Delivery
                      </Button>
                    )}
                    {order.canReview && (
                      <Button size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20">
                        Leave Review
                      </Button>
                    )}
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

                {order.status === "dispute" && (
                  <div className="bg-destructive/5 rounded-md p-3 flex items-start gap-3 text-sm border border-destructive/10">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-foreground font-medium">Dispute Under Review</p>
                      <p className="text-muted-foreground">Our team is investigating this order. You will be notified of the resolution within 24 hours.</p>
                    </div>
                  </div>
                )}
                <Link href={`/orders/${order.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary/80">
                    Details
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {orders.length === 0 && (
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