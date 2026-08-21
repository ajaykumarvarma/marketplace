import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { buffer } from "micro";
import { createNotification } from "@/services/notificationService";

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

async function sendTemplateEmail(to: string, template: string, props: Record<string, string>) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, template, props }),
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
          await sendTemplateEmail(
            buyerProfile.email,
            "order_confirmation",
            {
              buyerName: buyerProfile.full_name || "there",
              orderId: orderData.id.slice(0, 8),
              productTitle,
              amount: `$${(orderData.total_amount || 0).toFixed(2)}`,
              orderUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tradevault.io"}/orders/${orderData.id}`,
            }
          );
        }

        // Send notification to seller
        if (sellerProfile?.email) {
          await sendTemplateEmail(
            sellerProfile.email,
            "seller_notification",
            {
              sellerName: sellerProfile.full_name || "there",
              orderId: orderData.id.slice(0, 8),
              productTitle: (orderData.product as { title?: string })?.title || "your product",
              amount: `$${(orderData.total_amount || 0).toFixed(2)}`,
              dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tradevault.io"}/seller/dashboard`,
            }
          );
        }

        // Create in-app notifications
        await createNotification(
          orderData.buyer_id,
          "order",
          "Payment Confirmed",
          `Your order #${orderData.id.slice(0, 8)} has been paid and is being processed.`,
          { orderId: orderData.id, amount: orderData.total_amount }
        );

        await createNotification(
          orderData.seller_id,
          "order",
          "New Order Received",
          `You have a new order #${orderData.id.slice(0, 8)} for $${(orderData.total_amount || 0).toFixed(2)}.`,
          { orderId: orderData.id, amount: orderData.total_amount }
        );
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