import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft, Shield, Package, Clock, CheckCircle, AlertTriangle, MessageSquare, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

const orderData: Record<string, {
  id: string;
  product: string;
  seller: string;
  price: number;
  status: "pending" | "processing" | "delivered" | "completed" | "disputed";
  date: string;
  deliveryMethod: string;
  escrowReleased: boolean;
  tracking: { step: string; time: string; completed: boolean }[];
}> = {
  "ord-12345": {
    id: "TV-ORD-12345",
    product: "Steam Game Keys Bundle — 50+ Titles",
    seller: "GameVault",
    price: 12.99,
    status: "completed",
    date: "2026-08-10",
    deliveryMethod: "Instant Key Delivery",
    escrowReleased: true,
    tracking: [
      { step: "Order Placed", time: "Aug 10, 14:32", completed: true },
      { step: "Payment Confirmed", time: "Aug 10, 14:33", completed: true },
      { step: "Seller Processing", time: "Aug 10, 14:35", completed: true },
      { step: "Item Delivered", time: "Aug 10, 14:36", completed: true },
      { step: "Escrow Released", time: "Aug 10, 14:40", completed: true },
    ],
  },
  "ord-12346": {
    id: "TV-ORD-12346",
    product: "Spotify Premium 12-Month Subscription",
    seller: "SubMaster",
    price: 24.99,
    status: "delivered",
    date: "2026-08-11",
    deliveryMethod: "Account Credentials",
    escrowReleased: false,
    tracking: [
      { step: "Order Placed", time: "Aug 11, 09:15", completed: true },
      { step: "Payment Confirmed", time: "Aug 11, 09:16", completed: true },
      { step: "Seller Processing", time: "Aug 11, 09:20", completed: true },
      { step: "Item Delivered", time: "Aug 11, 09:25", completed: true },
      { step: "Awaiting Confirmation", time: "Pending", completed: false },
    ],
  },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const order = orderData[id as string];

  if (!order) {
    return (
      <div className="container py-16 text-center">
        <h1 className="font-display text-xl font-medium text-foreground">Order not found</h1>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const statusConfig = {
    pending: { color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
    processing: { color: "bg-primary/10 text-primary border-primary/20", icon: Package },
    delivered: { color: "bg-accent/10 text-accent border-accent/20", icon: CheckCircle },
    completed: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
    disputed: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  };

  const StatusIcon = statusConfig[order.status].icon;

  return (
    <>
      <SEO title={`Order ${order.id} — TradeVault`} description={`Track your order ${order.id} on TradeVault.`} />
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm text-muted-foreground">{order.id}</span>
                <Badge variant="outline" className={`${statusConfig[order.status].color} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">{order.product}</h1>
              <p className="text-muted-foreground">Sold by {order.seller}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-bold text-foreground">${order.price.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h2 className="font-display font-semibold text-foreground">Order Timeline</h2>
            <div className="space-y-4">
              {order.tracking.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${step.completed ? "bg-success/20" : "bg-muted"}`}>
                    {step.completed ? (
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{step.step}</p>
                    <p className="text-xs text-muted-foreground">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Escrow Status */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              <h2 className="font-display font-semibold text-foreground">Escrow Protection</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {order.escrowReleased
                ? "Your payment has been released to the seller. The transaction is complete."
                : "Your payment is held securely in escrow. Confirm delivery to release funds to the seller."}
            </p>
            {!order.escrowReleased && (
              <div className="flex gap-3">
                <Button className="gap-2 bg-success hover:bg-success/90 text-success-foreground">
                  <CheckCircle className="h-4 w-4" />
                  Confirm Delivery
                </Button>
                <Link href="/dispute">
                  <Button variant="outline" className="gap-2 border-border hover:bg-muted">
                    <AlertTriangle className="h-4 w-4" />
                    Open Dispute
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Delivery Info */}
          {order.status === "delivered" || order.status === "completed" ? (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="font-display font-semibold text-foreground">Delivery Details</h2>
              </div>
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Method: {order.deliveryMethod}</p>
                <div className="flex gap-3 pt-2">
                  <Button size="sm" variant="outline" className="gap-2 border-border hover:bg-muted">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 border-border hover:bg-muted">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Contact Seller
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/marketplace">
              <Button variant="outline" className="border-border hover:bg-muted">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="gap-2 border-border hover:bg-muted">
                <MessageSquare className="h-4 w-4" />
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}