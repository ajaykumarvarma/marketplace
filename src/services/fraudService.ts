import { supabase } from "@/integrations/supabase/client";

interface FraudCheckResult {
  riskScore: number;
  flags: string[];
  blocked: boolean;
}

interface OrderContext {
  buyerId: string;
  sellerId: string;
  productId: string;
  price: number;
  ipAddress?: string;
  deviceFingerprint?: string;
}

export async function checkFraudRisk(context: OrderContext): Promise<FraudCheckResult> {
  const flags: string[] = [];
  let riskScore = 0;

  // Velocity check: orders in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recentOrders, error: velocityError } = await supabase
    .from("orders")
    .select("id, total_amount")
    .eq("buyer_id", context.buyerId)
    .gte("created_at", oneHourAgo);

  if (!velocityError && recentOrders) {
    if (recentOrders.length >= 5) {
      riskScore += 30;
      flags.push("High velocity: 5+ orders in 1 hour");
    } else if (recentOrders.length >= 3) {
      riskScore += 15;
      flags.push("Elevated velocity: 3+ orders in 1 hour");
    }

    const totalSpend = recentOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
    if (totalSpend > 500) {
      riskScore += 25;
      flags.push(`High spend: $${totalSpend.toFixed(2)} in 1 hour`);
    }
  }

  // Velocity check: same product ordered recently
  const { data: sameProductOrders } = await supabase
    .from("orders")
    .select("id")
    .eq("buyer_id", context.buyerId)
    .eq("product_id", context.productId)
    .gte("created_at", oneHourAgo);

  if (sameProductOrders && sameProductOrders.length > 0) {
    riskScore += 20;
    flags.push("Same product reordered within 1 hour");
  }

  // Price anomaly check
  if (context.price > 500) {
    riskScore += 15;
    flags.push("High value order");
  }

  // Check buyer's fraud history via user_id
  const { data: fraudHistory } = await (supabase
    .from("fraud_logs") as any)
    .select("id")
    .eq("user_id", context.buyerId)
    .is("reviewed_at", null);

  if (fraudHistory && fraudHistory.length > 0) {
    riskScore += 40;
    flags.push(`Unresolved fraud alerts: ${fraudHistory.length}`);
  }

  // Check if IP has been flagged in metadata
  if (context.ipAddress) {
    const { data: ipFlags } = await (supabase
      .from("fraud_logs") as any)
      .select("id")
      .contains("metadata", { ip_address: context.ipAddress })
      .is("reviewed_at", null);

    if (ipFlags && ipFlags.length > 0) {
      riskScore += 35;
      flags.push("IP address has unresolved fraud alerts");
    }
  }

  return {
    riskScore: Math.min(riskScore, 100),
    flags,
    blocked: riskScore >= 80,
  };
}

export async function logFraudEvent(
  orderId: string,
  buyerId: string,
  flags: string[],
  riskScore: number,
  metadata?: { ipAddress?: string; deviceFingerprint?: string }
) {
  const { error } = await (supabase.from("fraud_logs") as any).insert({
    order_id: orderId,
    user_id: buyerId,
    event_type: riskScore >= 80 ? "block" : riskScore >= 50 ? "auto_hold" : "risk_score",
    risk_score: riskScore,
    reason: flags.join("; "),
    metadata: {
      ip_address: metadata?.ipAddress || null,
      device_fingerprint: metadata?.deviceFingerprint || null,
    },
  });

  return { error };
}

export function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return "";
  
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillText("TradeVault FP", 2, 2);
  }
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    !!window.sessionStorage,
    !!window.localStorage,
  ];
  
  return btoa(components.join("|")).slice(0, 32);
}

export async function getClientIP(): Promise<string> {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  } catch {
    return "unknown";
  }
}