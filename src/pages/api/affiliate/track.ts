import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { referralCode, buyerId, orderId, amount } = req.body;

  if (!referralCode || !buyerId || !orderId || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Find the referral code owner
    const { data: codeData } = await supabaseAdmin
      .from("referral_codes")
      .select("created_by, discount_percent")
      .eq("code", referralCode)
      .maybeSingle();

    if (!codeData) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    const commissionRate = 0.05; // 5% commission
    const commission = amount * commissionRate;

    // Track the referral
    const { error } = await supabaseAdmin.from("referral_tracking").insert({
      referrer_id: codeData.created_by,
      referred_id: buyerId,
      order_id: orderId,
      commission_amount: commission,
      status: "pending",
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true, commission });
  } catch (err) {
    console.error("Affiliate track error:", err);
    return res.status(500).json({ error: "Tracking failed" });
  }
}