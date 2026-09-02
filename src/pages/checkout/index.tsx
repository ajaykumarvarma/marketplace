import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ShoppingCart, ArrowLeft, CreditCard, Tag, Percent, Gift, Shield, Bitcoin, Loader2, Lock, AlertTriangle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkFraudRisk, logFraudEvent, getDeviceFingerprint, getClientIP } from "@/services/fraudService";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { items, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card");
  const [processing, setProcessing] = useState(false);
  const [fraudResult, setFraudResult] = useState<{ riskScore: number; flags: string[]; blocked: boolean } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discount_percent: number } | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [referralValid, setReferralValid] = useState(false);
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [checkingReferral, setCheckingReferral] = useState(false);

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

  const discountAmount = appliedCoupon ? (totalPrice * appliedCoupon.discount_percent) / 100 : 0;
  const finalTotal = (totalPrice - discountAmount) * 1.02;

  async function applyPromoCode() {
    if (!promoCode.trim() || !user) return;
    setPromoLoading(true);
    setPromoError(null);

    try {
      const res = await fetch("/api/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPromoError(data.error || "Invalid promo code");
      } else {
        setAppliedCoupon(data.coupon);
        toast({ title: "Promo code applied", description: `${data.coupon.discount_percent}% off` });
      }
    } catch {
      setPromoError("Failed to validate promo code");
    }

    setPromoLoading(false);
  }

  function removePromo() {
    setAppliedCoupon(null);
    setPromoCode("");
    setPromoError(null);
  }

  async function validateReferral(code: string) {
    if (!code.trim()) return;
    setCheckingReferral(true);
    const res = await fetch("/api/affiliate/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralCode: code.trim(), buyerId: user?.id, orderId: null, amount: null }),
    });
    setCheckingReferral(false);

    if (res.ok) {
      const data = await res.json();
      setReferralValid(true);
      setReferralDiscount(data.discountPercent || 0);
      toast({ title: "Referral applied!", description: `${data.discountPercent || 5}% discount applied.` });
    } else {
      setReferralValid(false);
      setReferralDiscount(0);
      toast({ title: "Invalid referral code", variant: "destructive" });
    }
  }

  async function handleStripeCheckout() {
    if (!user || items.length === 0) {
      toast({ title: "Sign in required", description: "Please sign in to complete your purchase.", variant: "destructive" });
      return;
    }

    setProcessing(true);

    const deviceFingerprint = await getDeviceFingerprint();
    const ipAddress = await getClientIP();
    const orderAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Fraud check
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

    // Create Stripe Checkout session
    try {
      // Calculate commission
      const sellerIds = [...new Set(items.map((item) => item.seller).filter(Boolean))];
      let totalCommission = 0;
      for (const sellerId of sellerIds) {
        const { data: sub } = await supabase
          .from("seller_subscriptions")
          .select("plan:plan_id(commission_rate)")
          .eq("seller_id", sellerId)
          .eq("status", "active")
          .maybeSingle();
        const commissionRate = (sub as unknown as { plan: { commission_rate: number } })?.plan?.commission_rate || 15;
        const sellerTotal = items.filter((i) => i.seller === sellerId).reduce((s, i) => s + i.price * i.quantity, 0);
        totalCommission += sellerTotal * (commissionRate / 100);
      }

      const res = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            seller: item.seller,
          })),
          userId: user.id,
          email: user.email,
          deviceFingerprint,
          ipAddress,
          couponId: appliedCoupon?.id,
          discountPercent: appliedCoupon?.discount_percent,
          commission: totalCommission,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      // Clear cart and redirect to Stripe
      clearCart();
      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      toast({ title: "Checkout failed", description: message, variant: "destructive" });
      setProcessing(false);
    }
  }

  return (
    <>
      <SEO title="Checkout — TradeVault" description="Secure checkout with escrow protection for digital goods." />
      <div className="container px-4 sm:px-6 py-8 md:py-12">
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
                  className={`flex items-center gap-3 p-4 rounded-lg border ${paymentMethod === "card" ? "border-foreground bg-muted" : "border-border bg-card hover:border-border"}`}
                >
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium text-foreground text-sm">Credit Card</p>
                    <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("crypto")}
                  className={`flex items-center gap-3 p-4 rounded-lg border ${paymentMethod === "crypto" ? "border-foreground bg-muted" : "border-border bg-card hover:border-border"}`}
                >
                  <Bitcoin className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium text-foreground text-sm">Cryptocurrency</p>
                    <p className="text-xs text-muted-foreground">BTC, ETH, USDT</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Promo Code Section */}
            <div className="mb-8">
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">Promo Code</h2>
              {!appliedCoupon ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="pl-9 border-border bg-card"
                        onKeyDown={(e) => e.key === "Enter" && applyPromoCode()}
                      />
                    </div>
                    <Button
                      onClick={applyPromoCode}
                      disabled={promoLoading || !promoCode.trim()}
                      variant="outline"
                      className="border-border"
                    >
                      {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Referral code (optional)"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="pl-9 border-border bg-card"
                      />
                    </div>
                    <Button
                      onClick={() => validateReferral(referralCode)}
                      disabled={checkingReferral || !referralCode.trim()}
                      variant="outline"
                      className="border-border"
                    >
                      {checkingReferral ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {appliedCoupon.code} — {appliedCoupon.discount_percent}% off
                    </p>
                  </div>
                  <button onClick={removePromo} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {promoError && (
                <p className="text-sm text-red-500 mt-2">{promoError}</p>
              )}
            </div>

            <div className="mb-4">
              {paymentMethod === "card" && (
                <div className="bg-card border border-border rounded-lg p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Secure Payment via Stripe</p>
                      <p className="text-xs text-muted-foreground">Your card details are never stored on our servers.</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You will be redirected to Stripe's secure checkout page to complete your payment.
                  </p>
                </div>
              )}

              {paymentMethod === "crypto" && (
                <div className="bg-card border border-border rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground mb-3">Send the exact amount to the address shown after confirmation. Your order will be processed once the transaction is verified.</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Network: Ethereum (ERC-20)</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 pt-4 mb-4">
                <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Escrow Protected</p>
                  <p className="text-xs text-muted-foreground">Your payment is held securely until you confirm delivery. If the seller fails to deliver, you get a full refund.</p>
                </div>
              </div>

              <Button onClick={handleStripeCheckout} disabled={processing} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${finalTotal.toFixed(2)}`
                )}
              </Button>
            </div>
          </div>

          <div>
            <div className="bg-card border border-border rounded-lg p-4 md:p-6 sm:sticky sm:top-24">
              <h2 className="font-display font-semibold text-foreground mb-4">Order Summary</h2>
              
              {fraudResult && fraudResult.riskScore >= 40 && (
                <div className="p-3 rounded-lg mb-4 bg-muted border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {fraudResult.blocked ? "Transaction Blocked" : "Security Review"}
                    </span>
                  </div>
                  <div className="mb-1">
                    {fraudResult.flags.map((flag, i) => (
                      <p key={i} className="text-xs text-muted-foreground">• {flag}</p>
                    ))}
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">Risk Score: {fraudResult.riskScore}/100</p>
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
                {appliedCoupon && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Discount ({appliedCoupon.discount_percent}%)</span>
                    <span className="font-mono text-green-500">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-mono text-foreground">${((totalPrice - discountAmount) * 0.02).toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="font-mono text-lg font-bold text-foreground">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}