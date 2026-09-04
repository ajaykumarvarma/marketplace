import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { createNotification } from "@/services/notificationService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function sendEmail(to: string, template: string, props: Record<string, string>) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://tradevault.io"}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, template, props }),
    });
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

// Disable body parsing for raw body access
export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

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

      // Fetch order details for emails and auto-delivery
      const { data: orderData } = await supabaseAdmin
        .from("orders")
        .select("id, buyer_id, seller_id, product_id, total_amount, product:product_id(title, auto_delivery, delivery_content)")
        .eq("stripe_session_id", session.id)
        .maybeSingle();

      if (orderData) {
        const productArray = orderData.product as unknown as Array<{ title?: string; auto_delivery?: boolean; delivery_content?: string }>;
        const product = productArray?.[0] || {};
        const isAutoDelivery = product?.auto_delivery === true;

        // Update order status to paid
        await supabaseAdmin
          .from("orders")
          .update({
            status: "paid",
            stripe_payment_intent_id: paymentIntent.id,
            paid_at: new Date().toISOString(),
          })
          .eq("id", orderData.id);

        // Send order confirmation email to buyer
        if (buyerProfile?.email) {
          await sendEmail(
            buyerProfile.email,
            "order_confirmation",
            {
              buyerName: buyerProfile.full_name || "there",
              orderId: orderData.id.slice(0, 8).toUpperCase(),
              productTitle: product?.title || "Digital Goods",
              totalAmount: `$${orderData.total_amount.toFixed(2)}`,
              orderUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tradevault.io"}/orders/${orderData.id}`,
              sellerName: sellerProfile?.full_name || "TradeVault Seller",
            }
          );
        }

        // Send seller notification email
        if (sellerProfile?.email) {
          await sendEmail(
            sellerProfile.email,
            "seller_notification",
            {
              sellerName: sellerProfile.full_name || "there",
              orderId: orderData.id.slice(0, 8).toUpperCase(),
              productTitle: product?.title || "Digital Goods",
              totalAmount: `$${orderData.total_amount.toFixed(2)}`,
              dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tradevault.io"}/seller/dashboard`,
            }
          );
        }

        // Create in-app notifications
        await createNotification(
          orderData.buyer_id,
          "order",
          "Payment Confirmed",
          `Your order for ${product?.title || "digital goods"} has been confirmed.`,
          { orderId: orderData.id }
        );

        await createNotification(
          orderData.seller_id,
          "order",
          "New Order",
          `You have a new order for ${product?.title || "digital goods"}.`,
          { orderId: orderData.id }
        );

        // AUTO-DELIVERY: Fetch unsold stock and assign to order
        if (isAutoDelivery) {
          const { data: stockItem } = await supabaseAdmin
            .from("product_stock")
            .select("id, key_code")
            .eq("product_id", orderData.product_id)
            .eq("sold", false)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (stockItem) {
            // Mark stock as sold and link to order
            await supabaseAdmin
              .from("product_stock")
              .update({ sold: true, order_id: orderData.id })
              .eq("id", stockItem.id);

            // Update order to delivered with the key
            await supabaseAdmin
              .from("orders")
              .update({
                status: "delivered",
                delivery_method: "digital",
                delivery_content: stockItem.key_code,
              })
              .eq("id", orderData.id);

            // Decrement product stock count
            await supabaseAdmin.rpc("decrement_product_stock", { p_id: orderData.product_id });
          }
        }

        // If auto-delivered, notify buyer of instant delivery
        if (isAutoDelivery) {
          await createNotification(
            orderData.buyer_id,
            "delivery",
            "Order Delivered Instantly",
            `Your order #${orderData.id.slice(0, 8)} has been automatically delivered. View it now.`,
            { orderId: orderData.id }
          );

          // Send delivery confirmation email
          if (buyerProfile?.email) {
            await sendEmail(
              buyerProfile.email,
              "delivery_confirmation",
              {
                buyerName: buyerProfile.full_name || "there",
                orderId: orderData.id.slice(0, 8).toUpperCase(),
                productTitle: product?.title || "Digital Goods",
                orderUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tradevault.io"}/orders/${orderData.id}`,
              }
            );
          }

          // Check for low stock alert
          const { count: remainingStock } = await supabaseAdmin
            .from("product_stock")
            .select("id", { count: "exact", head: true })
            .eq("product_id", orderData.product_id)
            .eq("sold", false);

          const stockCount = typeof remainingStock === "number" ? remainingStock : 0;
          if (stockCount <= 5) {
            // Send low stock email to seller
            if (sellerProfile?.email) {
              await sendTemplateEmail(
                sellerProfile.email,
                "low_stock",
                {
                  sellerName: sellerProfile.full_name || "there",
                  productTitle: product?.title || "your product",
                  stockCount: String(stockCount),
                  restockUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tradevault.io"}/seller/products/${orderData.product_id}/edit`,
                }
              );
            }

            // Create in-app notification
            await createNotification(
              orderData.seller_id,
              "system",
              "Low Stock Alert",
              `Your product "${product?.title || "Unknown"}" only has ${stockCount} keys remaining.`,
              { productId: orderData.product_id, stockCount: String(stockCount) }
            );
          }
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