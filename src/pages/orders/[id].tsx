import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Package, Clock, CheckCircle, AlertTriangle, ArrowLeft, MessageSquare, Shield, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ChatWindow } from "@/components/chat/ChatWindow";

type Order = {
  id: string;
  status: string;
  created_at: string;
  delivery_method: string | null;
  escrow_released: boolean;
  seller_id: string;
  product: { title: string; delivery_content: string | null } | null;
};

type OrderFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  content_type: string;
};

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [sellerProfile, setSellerProfile] = useState<{ full_name: string | null } | null>(null);
  const [orderFiles, setOrderFiles] = useState<OrderFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id || !user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id, status, created_at, delivery_method, escrow_released, seller_id,
        product:product_id(title, delivery_content)
      `)
      .eq("id", id as string)
      .eq("buyer_id", user.id)
      .maybeSingle();

    if (error || !data) {
      setOrder(null);
    } else {
      setOrder(data as unknown as Order);
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.seller_id)
        .maybeSingle();
      setSellerProfile(profile);

      const { data: files } = await supabase
        .from("order_files")
        .select("id, file_name, file_path, file_size, content_type")
        .eq("order_id", data.id);
      setOrderFiles(files || []);
    }
    setLoading(false);
  }, [id, user]);

  useEffect(() => {
    if (!id || !user) return;
    fetchOrder();
  }, [id, user, fetchOrder]);

  async function confirmDelivery() {
    if (!order || !user) return;
    setConfirming(true);
    const { error } = await supabase
      .from("orders")
      .update({ status: "completed", escrow_released: true })
      .eq("id", order.id)
      .eq("buyer_id", user.id);

    setConfirming(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Delivery confirmed", description: "Escrow released to seller." });
      setOrder({ ...order, status: "completed" });
    }
  }

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
        <p className="text-muted-foreground mt-4">Loading order...</p>
      </div>
    );
  }

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

  const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
    pending: { color: "bg-muted text-foreground border-border", icon: Clock },
    processing: { color: "bg-muted text-foreground border-border", icon: Package },
    shipped: { color: "bg-muted text-foreground border-border", icon: CheckCircle },
    delivered: { color: "bg-muted text-foreground border-border", icon: CheckCircle },
    completed: { color: "bg-muted text-foreground border-border", icon: CheckCircle },
    disputed: { color: "bg-muted text-foreground border-border", icon: AlertTriangle },
    cancelled: { color: "bg-muted text-muted-foreground", icon: AlertTriangle },
  };

  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  const steps = ["Order Placed", "Payment Confirmed", "Processing", "Shipped/Delivered", "Completed"];
  const stepIndex = ["pending", "processing", "shipped", "delivered", "completed"].indexOf(order.status);
  const currentStep = stepIndex >= 0 ? stepIndex : 0;

  return (
    <>
      <SEO title={`Order ${order.id.slice(0, 8)} — TradeVault`} description={`Track your order on TradeVault.`} />
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm text-muted-foreground">TV-ORD-{order.id.slice(0, 8).toUpperCase()}</span>
                <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">{order.product?.title || "Unknown Product"}</h1>
              <p className="text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-bold text-foreground">—</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="font-display font-semibold text-foreground mb-6">Order Timeline</h2>
            <div>
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4 mb-4">
                  <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${i <= currentStep ? "bg-muted" : "bg-muted"}`}>
                    {i <= currentStep ? <CheckCircle className="h-4 w-4 text-foreground" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{step}</p>
                    <p className="text-xs text-muted-foreground">{i <= currentStep ? "Completed" : "Pending"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-display font-semibold text-foreground">Escrow Protection</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {order.status === "completed"
                ? "Your payment has been released to the seller. The transaction is complete."
                : "Your payment is held securely in escrow. Confirm delivery to release funds to the seller."}
            </p>
            {order.status === "delivered" && (
              <div className="flex gap-3">
                <Button onClick={confirmDelivery} disabled={confirming} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Confirm Delivery
                </Button>
                <Link href="/dispute">
                  <Button variant="outline" className="gap-2 border-border">
                    <AlertTriangle className="h-4 w-4" />
                    Open Dispute
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {(order.status === "delivered" || order.status === "completed") && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-display font-semibold text-foreground">Delivery Details</h2>
              </div>
              <div className="bg-muted rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-3">Method: {order.delivery_method || "Digital delivery"}</p>
                {orderFiles.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {orderFiles.map((file) => (
                      <a
                        key={file.id}
                        href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/digital-files/${file.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-foreground hover:underline"
                      >
                        <Download className="h-4 w-4" />
                        <span>{file.file_name} ({(file.file_size / 1024 / 1024).toFixed(2)} MB)</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/80 mb-3">No files attached to this order.</p>
                )}
                <div className="flex gap-3">
                  <Link href={`/marketplace/${order.id}`}>
                    <Button size="sm" variant="outline" className="gap-2 border-border">
                      <MessageSquare className="h-4 w-4" />
                      Contact Seller
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {order.status === "completed" && (
            <div className="bg-muted border border-border rounded-lg p-4 mb-8">
              <h3 className="font-medium text-foreground flex items-center gap-2 mb-3">
                <Download className="h-4 w-4 text-muted-foreground" />
                Your Digital Goods
              </h3>
              <div className="bg-background rounded-lg p-3 font-mono text-sm text-foreground break-all mb-2">
                {order.product?.delivery_content || "Your order has been delivered. Contact the seller for access details."}
              </div>
              <p className="text-xs text-muted-foreground">Save this information securely. It will not be shown again.</p>
            </div>
          )}

          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              Order Messages
            </h2>
            <ChatWindow orderId={order.id} receiverId={order.seller_id} otherParty={sellerProfile as any} />
          </div>

          <div className="flex gap-3">
            <Link href="/marketplace">
              <Button variant="outline" className="border-border">Continue Shopping</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="gap-2 border-border">
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