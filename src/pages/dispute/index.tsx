import { useState } from "react";
import { useRouter } from "next/router";
import { AlertTriangle, MessageSquare, Send, ArrowLeft, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";

export default function DisputePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to file a dispute.", variant: "destructive" });
      return;
    }
    if (!orderId.trim() || !reason.trim()) {
      toast({ title: "Required fields", description: "Please provide order ID and reason.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { data: orderData } = await supabase
      .from("orders")
      .select("id, seller_id")
      .eq("id", orderId.trim())
      .eq("buyer_id", user.id)
      .maybeSingle();

    if (!orderData) {
      toast({ title: "Order not found", description: "Could not find this order in your history.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const { error } = await (supabase.from("disputes") as any).insert({
      order_id: orderId.trim(),
      buyer_id: user.id,
      seller_id: orderData.seller_id,
      reason,
      description: description.trim() || null,
      status: "open",
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Dispute filed", description: "Our team will review your case within 24 hours." });
      router.push("/orders");
    }
  }

  return (
    <>
      <SEO title="File a Dispute — TradeVault" description="Open a dispute for an order on TradeVault." />
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          <div className="text-center space-y-3">
            <div className="h-12 w-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">File a Dispute</h1>
            <p className="text-muted-foreground max-w-md mx-auto">We're here to help resolve issues between buyers and sellers fairly and quickly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: MessageSquare, title: "Contact Seller", desc: "Reach out to the seller first to resolve the issue directly" },
              { icon: FileText, title: "Submit Details", desc: "File a dispute with your order ID and a clear description" },
              { icon: Shield, title: "Team Review", desc: "Our support team reviews the case and mediates a fair outcome" },
            ].map((step, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 text-center space-y-2">
                <step.icon className="h-5 w-5 text-primary mx-auto" />
                <h3 className="font-medium text-sm text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order ID (e.g., TV-ORD-ABC123)"
                className="bg-muted border-border font-mono"
                required
              />
              <p className="text-xs text-muted-foreground">You can find this in your order history</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Dispute</Label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Select a reason</option>
                <option value="item_not_received">Item not received</option>
                <option value="item_not_as_described">Item not as described</option>
                <option value="seller_not_responding">Seller not responding</option>
                <option value="fraud_suspected">Fraud suspected</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail..."
                className="bg-muted border-border min-h-[120px]"
              />
            </div>

            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Important</p>
                  <p className="text-xs text-muted-foreground mt-1">False disputes may result in account suspension. Please ensure you have attempted to contact the seller before filing.</p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-12"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Dispute
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}