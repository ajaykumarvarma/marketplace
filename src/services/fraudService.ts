import { supabase } from "@/integrations/supabase/client";

interface FraudFactors {
  name: string;
  score: number;
  reason: string;
}

export interface FraudCheckResult {
  score: number;
  decision: "allow" | "review" | "block";
  factors: FraudFactors[];
}

export async function checkOrderFraud(
  userId: string,
  orderAmount: number,
  deviceFingerprint?: string
): Promise<FraudCheckResult> {
  const factors: FraudFactors[] = [];
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
  }

  // Amount check: unusually high order
  if (orderAmount > 500) {
    score += 15;
    factors.push({ name: "high_value", score: 15, reason: `Order amount $${orderAmount} exceeds $500` });
  }

  // Account age check
  const { data: profile } = await supabase
    .from("profiles")
    .select("created_at")
    .eq("id", userId)
    .maybeSingle();

  if (profile) {
    const accountAge = Date.now() - new Date(profile.created_at).getTime();
    const accountDays = accountAge / (24 * 60 * 60 * 1000);
    if (accountDays < 1) {
      score += 20;
      factors.push({ name: "new_account", score: 20, reason: "Account created less than 24h ago" });
    } else if (accountDays < 7) {
      score += 10;
      factors.push({ name: "recent_account", score: 10, reason: "Account created less than 7 days ago" });
    }
  }

  // Device fingerprint check (simplified)
  if (deviceFingerprint) {
    const { count: deviceOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("buyer_id", userId)
      .neq("buyer_id", userId); // Placeholder: would check against known devices

    if (deviceOrders && deviceOrders > 0) {
      // Would compare device fingerprint here
    }
  }

  // Determine decision
  let decision: "allow" | "review" | "block" = "allow";
  if (score >= 70) decision = "block";
  else if (score >= 40) decision = "review";

  return { score, decision, factors };
}

export async function recordFraudScore(
  orderId: string,
  userId: string,
  result: FraudCheckResult
) {
  await supabase.from("fraud_scores").insert({
    order_id: orderId,
    user_id: userId,
    score: result.score,
    factors: result.factors,
    decision: result.decision,
  });

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