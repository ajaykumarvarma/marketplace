import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { rateLimitByIP } from "@/services/rateLimiter";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting
  const clientIP = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "unknown";
  const rateLimit = await rateLimitByIP(clientIP);
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: "Too many requests" });
  }

  try {
    const { items, userId, email, deviceFingerprint, ipAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0 || !userId) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Calculate totals
    const lineItems = items.map((item: { title: string; price: number; quantity: number }) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
        },
        unit_amount: Math.round(item.price * 100), // cents
      },
      quantity: item.quantity,
    }));

    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
    const platformFee = Math.round(subtotal * 0.02 * 100); // 2% fee in cents

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.origin}/orders?success=true`,
      cancel_url: `${req.headers.origin}/checkout?canceled=true`,
      customer_email: email,
      metadata: {
        userId,
        deviceFingerprint: deviceFingerprint || "",
        ipAddress: ipAddress || "",
        itemCount: String(items.length),
      },
      payment_intent_data: {
        metadata: {
          userId,
          platformFee: String(platformFee),
        },
      },
    });

    // Store pending order in database
    const orderInserts = items.map((item: { id: string; title: string; price: number; quantity: number; seller: string }) => ({
      buyer_id: userId,
      product_id: item.id,
      quantity: item.quantity,
      total_amount: item.price * item.quantity * 1.02,
      delivery_method: "digital",
      payment_method: "card",
      status: "pending",
      device_fingerprint: deviceFingerprint || null,
      ip_address: ipAddress || null,
      stripe_session_id: session.id,
    }));

    const { error: orderError } = await supabaseAdmin.from("orders").insert(orderInserts);

    if (orderError) {
      console.error("Failed to create pending orders:", orderError);
      // Don't fail the checkout — Stripe session is already created
    }

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    const message = err instanceof Error ? err.message : "Checkout failed";
    return res.status(500).json({ error: message });
  }
}