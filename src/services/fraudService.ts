import { supabase } from "@/integrations/supabase/client";

interface FraudFactors {
  [key: string]: string | number;
  name: string;
  score: number;
  reason: string;
}

export interface FraudCheckResult {
  score: number;
  decision: "allow" | "review" | "block";
  factors: FraudFactors[];
  blocked: boolean;
  flags: string[];
}

// Aliases for checkout page compatibility
export const checkFraudRisk = checkOrderFraud;

export async function logFraudEvent(event: string, data: Record<string, unknown>) {
  console.log("[Fraud Event]", event, data);
}

// Real device fingerprint using entropy sources
export async function getDeviceFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.fillText("TradeVault FP v2", 2, 2);
    }
    const canvasData = canvas.toDataURL();

    const entropy = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
      canvasData.slice(-50),
      navigator.hardwareConcurrency || "unknown",
    ].join("|");

    // Simple hash
    let hash = 0;
    for (let i = 0; i < entropy.length; i++) {
      const char = entropy.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return "fp_" + Math.abs(hash).toString(36);
  } catch {
    return "fp_fallback_" + Date.now();
  }
}

// Get client IP via API (can't get real IP client-side due to privacy)
export async function getClientIP(): Promise<string> {
  try {
    const res = await fetch("/api/rate-limit");
    if (res.ok) {
      const data = await res.json();
      return data.ip || "unknown";
    }
  } catch {
    // Fallback
  }
  return "unknown";
}

export async function checkOrderFraud(
  userId: string,
  orderAmount: number,
  deviceFingerprint?: string,
  clientIP?: string
): Promise<FraudCheckResult> {
  const factors: FraudFactors[] = [];
  const flags: string[] = [];
  let score = 0;

  // Velocity check: orders in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("buyer_id", userId)
    .gte("created_at", oneHourAgo);

  if (recentOrders && recentOrders > 5) {
    score += 25;
    factors.push({ name: "velocity", score: 25, reason: `${recentOrders} orders in last hour` });
    flags.push("High order velocity detected");
  }

  // Velocity check: orders in last 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: dailyOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("buyer_id", userId)
    .gte("created_at", oneDayAgo);

  if (dailyOrders && dailyOrders > 20) {
    score += 20;
    factors.push({ name: "daily_velocity", score: 20, reason: `${dailyOrders} orders in 24h` });
    flags.push("Daily order limit exceeded");
  }

  // Amount check: unusually high order
  if (orderAmount > 500) {
    score += 15;
    factors.push({ name: "high_value", score: 15, reason: `Order amount $${orderAmount} exceeds $500` });
    flags.push("High-value transaction");
  }

  // Amount check: micro-transactions (card testing)
  if (orderAmount > 0 && orderAmount < 1) {
    score += 15;
    factors.push({ name: "micro_transaction", score: 15, reason: `Order amount $${orderAmount} below $1 threshold` });
    flags.push("Suspicious micro-transaction pattern");
  }

  // Account age check
  const { data: profile } = await supabase
    .from("profiles")
    .select("created_at, role")
    .eq("id", userId)
    .maybeSingle();

  if (profile) {
    const accountAge = Date.now() - new Date(profile.created_at).getTime();
    const accountDays = accountAge / (24 * 60 * 60 * 1000);
    if (accountDays < 1) {
      score += 20;
      factors.push({ name: "new_account", score: 20, reason: "Account created less than 24h ago" });
      flags.push("New account — first 24 hours");
    } else if (accountDays < 7) {
      score += 10;
      factors.push({ name: "recent_account", score: 10, reason: "Account created less than 7 days ago" });
      flags.push("Recently created account");
    }
  }

  // Device fingerprint velocity (same device, multiple accounts)
  if (deviceFingerprint && deviceFingerprint !== "fp_fallback") {
    const { count: deviceAccounts } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("device_fingerprint", deviceFingerprint)
      .neq("buyer_id", userId);

    if (deviceAccounts && deviceAccounts > 2) {
      score += 20;
      factors.push({ name: "device_shared", score: 20, reason: `${deviceAccounts} accounts used same device` });
      flags.push("Device fingerprint linked to multiple accounts");
    }
  }

  // IP-based velocity check
  if (clientIP && clientIP !== "unknown") {
    const { count: ipAccounts } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", clientIP)
      .neq("buyer_id", userId);

    if (ipAccounts && ipAccounts > 3) {
      score += 15;
      factors.push({ name: "ip_shared", score: 15, reason: `${ipAccounts} accounts from same IP` });
      flags.push("Multiple accounts from same IP address");
    }
  }

  // Determine decision
  let decision: "allow" | "review" | "block" = "allow";
  if (score >= 70) decision = "block";
  else if (score >= 40) decision = "review";

  return {
    score,
    decision,
    factors,
    blocked: decision === "block",
    flags: flags.length > 0 ? flags : ["Transaction appears normal"],
  };
}

export async function checkSellerFraud(
  sellerId: string,
  productPrice: number
): Promise<FraudCheckResult> {
  const factors: FraudFactors[] = [];
  const flags: string[] = [];
  let score = 0;

  // Seller listing velocity
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentListings } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", sellerId)
    .gte("created_at", oneHourAgo);

  if (recentListings && recentListings > 10) {
    score += 20;
    factors.push({ name: "listing_velocity", score: 20, reason: `${recentListings} listings in last hour` });
    flags.push("Excessive listing velocity");
  }

  // Price manipulation check
  if (productPrice > 1000) {
    score += 10;
    factors.push({ name: "high_price", score: 10, reason: `Listing price $${productPrice} exceeds $1000` });
    flags.push("High-priced item — review recommended");
  }

  // Determine decision
  let decision: "allow" | "review" | "block" = "allow";
  if (score >= 50) decision = "block";
  else if (score >= 25) decision = "review";

  return {
    score,
    decision,
    factors,
    blocked: decision === "block",
    flags: flags.length > 0 ? flags : ["Seller profile appears normal"],
  };
}

export async function checkCouponAbuse(
  userId: string,
  couponCode: string
): Promise<{ abused: boolean; reason?: string }> {
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("buyer_id", userId)
    .not("coupon_id", "is", null);

  if (count && count > 5) {
    return { abused: true, reason: "Excessive coupon usage detected" };
  }

  return { abused: false };
}

export async function recordFraudScore(
  orderId: string,
  userId: string,
  result: FraudCheckResult
) {
  // Use upsert to prevent race conditions on duplicate order IDs
  await supabase.from("fraud_scores").upsert({
    order_id: orderId,
    user_id: userId,
    score: result.score,
    factors: result.factors,
    decision: result.decision,
  }, { onConflict: "order_id" });

  if (result.decision !== "allow") {
    await supabase.from("fraud_alerts").insert({
      order_id: orderId,
      user_id: userId,
      alert_type: result.decision === "block" ? "behavior" : "velocity",
      severity: result.score >= 70 ? "critical" : result.score >= 50 ? "high" : "medium",
      description: `Fraud score ${result.score}: ${result.factors.map((f) => f.reason).join("; ")}`,
    });
  }

  return result;
}

export async function getFraudAlerts(status?: "open" | "reviewing" | "resolved" | "false_positive") {
  let query = supabase
    .from("fraud_alerts")
    .select("*, user:profiles!fraud_alerts_user_id_fkey(full_name, email)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}

export async function resolveFraudAlert(
  alertId: string,
  status: "resolved" | "false_positive",
  adminId: string
) {
  return await supabase
    .from("fraud_alerts")
    .update({
      status,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", alertId);
}