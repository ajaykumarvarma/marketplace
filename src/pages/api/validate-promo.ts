import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { rateLimitByIP } from "@/services/rateLimiter";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clientIP = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "unknown";
  const rateLimit = await rateLimitByIP(clientIP);
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: "Too many requests" });
  }

  try {
    const { code, userId } = req.body;

    if (!code || typeof code !== "string" || !userId) {
      return res.status(400).json({ error: "Missing required fields: code, userId" });
    }

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("active", true)
      .maybeSingle();

    if (error || !coupon) {
      return res.status(404).json({ error: "Invalid promo code" });
    }

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ error: "Promo code has expired" });
    }

    // Check max uses
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return res.status(400).json({ error: "Promo code limit reached" });
    }

    // Check if user already used this coupon
    const { data: existingOrder } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("buyer_id", userId)
      .eq("coupon_id", coupon.id)
      .maybeSingle();

    if (existingOrder) {
      return res.status(400).json({ error: "You have already used this promo code" });
    }

    return res.status(200).json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_percent: coupon.discount_percent,
      },
    });
  } catch (err) {
    console.error("Validate promo error:", err);
    return res.status(500).json({ error: "Failed to validate promo code" });
  }
}