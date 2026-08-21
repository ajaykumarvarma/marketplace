import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { buffer } from "micro";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Disable body parsing for raw body access
export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    });
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"] as string;
  const buf = await buffer(req);
  const payload = buf.toString();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return res.status(400).json({ error: `Webhook Error: ${message}` });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Update orders to paid status
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          stripe_payment_intent_id: session.payment_intent as string,
          paid_at: new Date().toISOString(),
        })
        .eq("stripe_session_id", session.id);

      if (updateError) {
        console.error("Failed to update order status:", updateError);
      }

      // Fetch order details for emails
      const { data: orderData } = await supabaseAdmin
        .from("orders")
        .select("id, buyer_id, seller_id, total_amount, product:product_id(title)")
        .eq("stripe_session_id", session.id)
        .maybeSingle();

      if (orderData) {
        const { data: buyerProfile } = await supabaseAdmin
          .from("profiles")
          .select("email, full_name")
          .eq("id", orderData.buyer_id)
          .maybeSingle();

        const { data: sellerProfile } = await supabaseAdmin
          .from("profiles")
          .select("email, full_name")
          .eq("id", orderData.seller_id)
          .maybeSingle();

        // Send order confirmation to buyer
        if (buyerProfile?.email) {
          const productTitle = (orderData.product as { title?: string })?.title || "your order";
          await sendEmail(
            buyerProfile.email,
            `Payment Confirmed — Order #${orderData.id.slice(0, 8)}`,
            `
            <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#E8ECF1;background:#0B0F14;border:1px solid #232D3B;border-radius:8px;">
              <h2 style="color:#5B8EC8;margin:0 0 16px;">Payment Confirmed</h2>
              <p>Hi ${buyerProfile.full_name || "there"},</p>
              <p>Your payment for <strong>${productTitle}</strong> has been received and is now in escrow.</p>
              <div style="background:#111820;padding:16px;border-radius:6px;margin:16px 0;">
                <p style="margin:4px 0;"><strong>Order:</strong> #${orderData.id.slice(0, 8)}</p>
                <p style="margin:4px 0;"><strong>Amount:</strong> $${(orderData.total_amount || 0).toFixed(2)}</p>
              </div>
              <p>The seller has been notified and will deliver your order shortly.</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://tradevault.io"}/orders/${orderData.id}" style="display:inline-block;background:#5B8EC8;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:16px;">View Order</a>
            </div>
            `
          );
        }

        // Send notification to seller
        if (sellerProfile?.email) {
          await sendEmail(
            sellerProfile.email,
            `New Order — #${orderData.id.slice(0, 8)}`,
            `
            <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#E8ECF1;background:#0B0F14;border:1px solid #232D3B;border-radius:8px;">
              <h2 style="color:#3DD6D0;margin:0 0 16px;">New Order Received</h2>
              <p>Hi ${sellerProfile.full_name || "there"},</p>
              <p>You have a new order to fulfill.</p>
              <div style="background:#111820;padding:16px;border-radius:6px;margin:16px 0;">
                <p style="margin:4px 0;"><strong>Order:</strong> #${orderData.id.slice(0, 8)}</p>
                <p style="margin:4px 0;"><strong>Amount:</strong> $${(orderData.total_amount || 0).toFixed(2)}</p>
              </div>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://tradevault.io"}/seller/dashboard" style="display:inline-block;background:#3DD6D0;color:#0B0F14;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:16px;">Go to Dashboard</a>
            </div>
            `
          );
        }
      }

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const sessionId = paymentIntent.metadata?.sessionId;

      if (sessionId) {
        await supabaseAdmin
          .from("orders")
          .update({ status: "payment_failed" })
          .eq("stripe_session_id", sessionId);
      }

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return res.status(200).json({ received: true });
}