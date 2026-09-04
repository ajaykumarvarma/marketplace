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

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  seller_id: string;
}

interface CheckoutBody {
  items: CartItem[];
  userId: string;
  email?: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  couponId?: string | null;
  discountPercent?: number;
  commission?: number;
}

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
    const { items, userId, email, deviceFingerprint, ipAddress, couponId, discountPercent, commission } = req.body as CheckoutBody;

    if (!items || !Array.isArray(items) || items.length === 0 || !userId) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
    const discountAmount = discountPercent ? (subtotal * discountPercent) / 100 : 0;
    const discountedSubtotal = subtotal - discountAmount;
    const platformFee = Math.round(discountedSubtotal * 0.02 * 100); // 2% fee in cents

    // Create a composite order ID for metadata
    const orderId = `batch_${Date.now()}`;

    // Build line items
    const lineItems = items.map((item: CartItem) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
        },
        unit_amount: Math.round(item.price * 100), // cents
      },
      quantity: item.quantity,
    }));

    // Apply coupon discount as a separate line item if applicable
    if (discountAmount > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `Discount (${discountPercent}%)`,
          },
          unit_amount: -Math.round(discountAmount * 100), // negative for discount
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tradevault.io"}/orders/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tradevault.io"}/cart?canceled=1`,
      customer_email: email,
      metadata: {
        order_id: orderId,
        buyer_id: userId,
        coupon_code: req.body.couponCode || "",
        commission: String(commission || 0),
      },
      payment_intent_data: {
        metadata: {
          userId,
          platformFee: String(platformFee),
          couponId: couponId || "",
        },
      },
    });

    // Fetch seller_ids for each product
    const productIds = items.map((item: { id: string }) => item.id);
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, seller_id")
      .in("id", productIds);

    if (productsError) {
      console.error("Failed to fetch product seller_ids:", productsError);
    }

    const sellerMap = new Map<string, string>();
    (productsData || []).forEach((p: { id: string; seller_id: string }) => {
      sellerMap.set(p.id, p.seller_id);
    });

    // Store pending order in database
    const orderInserts = items.map((item: CartItem) => ({
      buyer_id: userId,
      seller_id: sellerMap.get(item.id) || userId, // fallback to buyer (will fail validation if null, but prevents crash)
      product_id: item.id,
      quantity: item.quantity,
      total_amount: item.price * item.quantity * (1 - (discountPercent || 0) / 100) * 1.02,
      delivery_method: "digital",
      payment_method: "card",
      status: "pending",
      device_fingerprint: deviceFingerprint || null,
      ip_address: ipAddress || null,
      stripe_session_id: session.id,
      coupon_id: couponId || null,
      discount_amount: discountAmount || 0,
    }));

    const { error: orderError } = await supabaseAdmin.from("orders").insert(orderInserts);

    if (orderError) {
      console.error("Failed to create pending orders:", orderError);
      // Don't fail the checkout — Stripe session is already created
    }

    // Increment coupon used_count if applicable
    if (couponId) {
      await supabaseAdmin.rpc("increment_coupon_usage", { coupon_id: couponId });
    }

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    const message = err instanceof Error ? err.message : "Checkout failed";
    return res.status(500).json({ error: message });
  }
}