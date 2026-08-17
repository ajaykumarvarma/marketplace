import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CreditCard, Shield, Bitcoin, AlertTriangle, CheckCircle, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkFraudRisk, recordFraudScore, logFraudEvent, getDeviceFingerprint, getClientIP } from "@/services/fraudService";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { items, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card");
  const [processing, setProcessing] = useState(false);
  const [fraudResult, setFraudResult] = useState<{ riskScore: number; flags: string[]; blocked: boolean } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) {
      router.push("/auth/login?redirect=/checkout");
    }
  }, [user, router]);

  if (!mounted) {
    return (
      <>
        <SEO title="Checkout — TradeVault" description="Secure checkout with escrow protection." />
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 bg-muted rounded w-1/3 mb-4" />
            <div className="h-48 bg-muted rounded-lg" />
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <SEO title="Checkout — TradeVault" description="Secure checkout with escrow protection." />
        <div className="container py-16 text-center">
          <h1 className="font-display text-xl font-medium text-foreground">Please sign in to checkout</h1>
          <Link href="/auth/login?redirect=/checkout">
            <Button className="mt-4">Sign In</Button>
          </Link>
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <SEO title="Checkout — TradeVault" description="Secure checkout with escrow protection." />
        <div className="container py-16 text-center">
          <h1 className="font-display text-xl font-medium text-foreground">Your cart is empty</h1>
          <Link href="/marketplace">
            <Button variant="outline" className="mt-4">Browse Marketplace</Button>
          </Link>
        </div>
      </>
    );
  }

  async function handlePlaceOrder() {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to complete your purchase.", variant: "destructive" });
      return;
    }
    if (items.length === 0) {
      toast({ title: "Cart is empty", description: "Add items before checking out.", variant: "destructive" });
      return;
    }

    setProcessing(true);

    const product = items[0];
    const orderAmount = product.price * product.quantity;
    const deviceFingerprint = await getDeviceFingerprint();
    const ipAddress = await getClientIP();

    const fraudCheck = await checkFraudRisk(user.id, orderAmount, deviceFingerprint);
    const riskScore = fraudCheck.score;
    const blocked = fraudCheck.decision === "block";
    const flags = fraudCheck.factors.map((f) => f.reason);

    setFraudResult({ riskScore, flags, blocked });

    if (blocked) {
      await logFraudEvent("blocked", { userId: user.id, flags, riskScore, ipAddress, deviceFingerprint });
      toast({ title: "Transaction blocked", description: "This transaction was flagged as high risk. Contact support if you believe this is an error.", variant: "destructive" });
      setProcessing(false);
      return;
    }

    if (riskScore >= 40) {
      await logFraudEvent("auto_hold", { userId: user.id, flags, riskScore, ipAddress, deviceFingerprint });
      toast({ title: "Transaction on hold", description: "Your order is under review for security. You will be notified shortly.", variant: "default" });
    }

    const total = orderAmount * 1.02;
    const { data: productData } = await supabase
      .from("products")
      .select("seller_id")
      .eq("id", product.id)
      .maybeSingle();

    const { data: orderData, error } = await supabase.from("orders").insert({
      buyer_id: user.id,
      seller_id: productData?.seller_id || "unknown",
      product_id: product.id,
      quantity: product.quantity,
      total_amount: total,
      delivery_method: "digital",
      payment_method: paymentMethod,
      status: riskScore >= 40 ? "processing" : "pending",
    } as any).select().single();

    if (orderData) {
      await recordFraudScore(orderData.id, user.id, fraudCheck);
    }

    setProcessing(false);

    if (error) {
      toast({ title: "Checkout failed", description: error.message, variant: "destructive" });
      return;
    }

    clearCart();
    toast({ title: "Order placed!", description: "Your purchase is being processed." });
    router.push(`/orders/${orderData.id}`);
  }

  return (
    <>
      <SEO title="Checkout — TradeVault" description="Secure checkout with escrow protection for digital goods." />
      <div className="container py-8 md:py-12">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>

        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-3 p-4 rounded-lg border ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`}
                >
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-foreground text-sm">Credit Card</p>
                    <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("crypto")}
                  className={`flex items-center gap-3 p-4 rounded-lg border ${paymentMethod === "crypto" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`}
                >
                  <Bitcoin className="h-5 w-5 text-warning" />
                  <div className="text-left">
                    <p className="font-medium text-foreground text-sm">Cryptocurrency</p>
                    <p className="text-xs text-muted-foreground">BTC, ETH, USDT</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="mb-4">
              {paymentMethod === "card" && (
                <div>
                  <div className="mb-4">
                    <Label htmlFor="cardName" className="mb-2 block">Name on Card</Label>
                    <Input id="cardName" placeholder="John Doe" className="bg-muted border-border" />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="cardNumber" className="mb-2 block">Card Number</Label>
                    <Input id="cardNumber" placeholder="4242 4242 4242 4242" className="bg-muted border-border font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="expiry" className="mb-2 block">Expiry</Label>
                      <Input id="expiry" placeholder="MM/YY" className="bg-muted border-border font-mono" />
                    </div>
                    <div>
                      <Label htmlFor="cvc" className="mb-2 block">CVC</Label>
                      <Input id="cvc" placeholder="123" className="bg-muted border-border font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "crypto" && (
                <div className="bg-card border border-border rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground mb-3">Send the exact amount to the address shown after confirmation. Your order will be processed once the transaction is verified.</p>
                  <div className="flex items-center gap-2 text-sm text-warning">
                    <Lock className="h-4 w-4" />
                    <span>Network: Ethereum (ERC-20)</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 pt-4 mb-4">
                <Shield className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Escrow Protected</p>
                  <p className="text-xs text-muted-foreground">Your payment is held securely until you confirm delivery. If the seller fails to deliver, you get a full refund.</p>
                </div>
              </div>

              <Button onClick={handlePlaceOrder} disabled={processing} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${(totalPrice * 1.02).toFixed(2)}`
                )}
              </Button>
            </div>
          </div>

          <div>
            <div className="bg-card border border-border rounded-lg p-4 md:p-6 sm:sticky sm:top-24">
              <h2 className="font-display font-semibold text-foreground mb-4">Order Summary</h2>
              
              {fraudResult && fraudResult.riskScore >= 40 && (
                <div className={`p-3 rounded-lg mb-4 ${fraudResult.blocked ? "bg-destructive/10 border border-destructive/20" : "bg-warning/10 border border-warning/20"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className={`h-4 w-4 ${fraudResult.blocked ? "text-destructive" : "text-warning"}`} />
                    <span className={`text-sm font-medium ${fraudResult.blocked ? "text-destructive" : "text-warning"}`}>
                      {fraudResult.blocked ? "Transaction Blocked" : "Security Review"}
                    </span>
                  </div>
                  <div className="mb-1">
                    {fraudResult.flags.map((flag, i) => (
                      <p key={i} className={`text-xs ${fraudResult.blocked ? "text-destructive/80" : "text-warning/80"}`}>• {flag}</p>
                    ))}
                  </div>
                  <p className={`text-xs font-mono ${fraudResult.blocked ? "text-destructive/70" : "text-warning/70"}`}>Risk Score: {fraudResult.riskScore}/100</p>
                </div>
              )}

              <div className="mb-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground truncate max-w-[200px]">{item.title} x{item.quantity}</span>
                    <span className="font-mono text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono text-foreground">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-mono text-foreground">${(totalPrice * 0.02).toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="font-mono text-lg font-bold text-foreground">${(totalPrice * 1.02).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}