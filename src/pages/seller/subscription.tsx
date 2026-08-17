import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Check, X, Zap, Crown, Star, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  commission_rate: number;
  max_products: number;
  featured_listing: boolean;
  analytics_advanced: boolean;
  custom_branding: boolean;
  priority_support: boolean;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export default function SubscriptionPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  async function fetchData() {
    setLoading(true);
    const { data: plansData } = await supabase.from("subscription_plans").select("*").eq("active", true).order("price_monthly");
    const { data: subData } = await supabase
      .from("seller_subscriptions")
      .select("*")
      .eq("seller_id", user!.id)
      .eq("status", "active")
      .maybeSingle();
    setPlans(plansData || []);
    setSubscription(subData);
    setLoading(false);
  }

  async function subscribe(planId: string) {
    // In production, this would redirect to Stripe Checkout
    toast({
      title: "Redirecting to checkout...",
      description: "Stripe integration would initialize here.",
    });
    // Mock successful subscription for demo
    await supabase.from("seller_subscriptions").upsert({
      seller_id: user!.id,
      plan_id: planId,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    fetchData();
  }

  if (!profile) {
    return (
      <div className="container py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading...</p>
      </div>
    );
  }

  if (profile.role !== "seller" && profile.role !== "admin") {
    return (
      <div className="container py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-xl font-bold">Seller Account Required</h1>
        <Button onClick={() => router.push("/sell")} className="mt-4">Become a Seller</Button>
      </div>
    );
  }

  const currentPlan = plans.find((p) => p.id === subscription?.plan_id);

  return (
    <>
      <SEO title="Subscription — TradeVault Seller" />
      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold mb-2">Seller Plans</h1>
          <p className="text-foreground/70">Choose the plan that fits your business</p>
          <div className="flex justify-center gap-2 mt-4">
            <Button variant={billingCycle === "monthly" ? "default" : "outline"} size="sm" onClick={() => setBillingCycle("monthly")}>Monthly</Button>
            <Button variant={billingCycle === "yearly" ? "default" : "outline"} size="sm" onClick={() => setBillingCycle("yearly")}>Yearly <Badge className="ml-1 bg-accent text-accent-foreground">Save 20%</Badge></Button>
          </div>
        </div>

        {currentPlan && (
          <div className="mb-6 p-4 border border-primary/20 rounded-lg bg-primary/5 text-center">
            <p className="text-sm text-foreground/70">Current Plan: <span className="font-semibold text-foreground">{currentPlan.name}</span></p>
            {subscription?.cancel_at_period_end && (
              <p className="text-xs text-destructive mt-1">Cancels on {new Date(subscription.current_period_end!).toLocaleDateString()}</p>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className={`border rounded-lg p-6 ${currentPlan?.id === plan.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {plan.slug === "free" && <Star className="h-5 w-5 text-muted-foreground" />}
                  {plan.slug === "basic" && <Zap className="h-5 w-5 text-primary" />}
                  {plan.slug === "pro" && <Crown className="h-5 w-5 text-accent" />}
                  <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                </div>
                <p className="text-sm text-foreground/70 mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="font-display text-3xl font-bold">${billingCycle === "monthly" ? plan.price_monthly : plan.price_yearly}</span>
                  <span className="text-foreground/50">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                </div>
                <div className="space-y-2 mb-6">
                  <Feature included={true} text={`${plan.max_products} products`} />
                  <Feature included={true} text={`${plan.commission_rate}% commission`} />
                  <Feature included={plan.featured_listing} text="Featured listings" />
                  <Feature included={plan.analytics_advanced} text="Advanced analytics" />
                  <Feature included={plan.custom_branding} text="Custom branding" />
                  <Feature included={plan.priority_support} text="Priority support" />
                </div>
                <Button
                  className="w-full"
                  variant={currentPlan?.id === plan.id ? "outline" : "default"}
                  disabled={currentPlan?.id === plan.id}
                  onClick={() => subscribe(plan.id)}
                >
                  {currentPlan?.id === plan.id ? "Current Plan" : "Subscribe"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Feature({ included, text }: { included: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {included ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-foreground/30" />}
      <span className={included ? "text-foreground/80" : "text-foreground/40"}>{text}</span>
    </div>
  );
}