import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { rateLimitByIP } from "@/services/rateLimiter";
import { OrderConfirmation } from "@/emails/OrderConfirmation";
import { SellerNotification } from "@/emails/SellerNotification";
import { DeliveryConfirmation } from "@/emails/DeliveryConfirmation";
import { FollowUpEmail } from "@/emails/FollowUpEmail";
import { PriceDropEmail } from "@/emails/PriceDropEmail";

const resend = new Resend(process.env.RESEND_API_KEY || "");

type EmailTemplate = "order_confirmation" | "seller_notification" | "delivery_confirmation" | "follow_up" | "price_drop" | "low_stock";

interface TemplateEmailRequest {
  to: string;
  template: EmailTemplate;
  props: Record<string, string>;
}

interface RawEmailRequest {
  to: string;
  subject: string;
  html: string;
}

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
    const body = req.body as TemplateEmailRequest | RawEmailRequest;

    if (!body.to) {
      return res.status(400).json({ error: "Missing required field: to" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    let subject: string;
    let html: string;

    // Template-based email
    if ("template" in body) {
      switch (body.template) {
        case "order_confirmation":
          subject = `Payment Confirmed — Order #${body.props.orderId || "00000000"}`;
          html = await render(OrderConfirmation({
            buyerName: body.props.buyerName || "there",
            orderId: body.props.orderId || "00000000",
            productTitle: body.props.productTitle || "your order",
            amount: body.props.amount || "$0.00",
            orderUrl: body.props.orderUrl || "https://tradevault.io/orders",
          }));
          break;
        case "seller_notification":
          subject = `New Order — #${body.props.orderId || "00000000"}`;
          html = await render(SellerNotification({
            sellerName: body.props.sellerName || "there",
            orderId: body.props.orderId || "00000000",
            productTitle: body.props.productTitle || "your product",
            amount: body.props.amount || "$0.00",
            dashboardUrl: body.props.dashboardUrl || "https://tradevault.io/seller/dashboard",
          }));
          break;
        case "delivery_confirmation":
          subject = `Order Delivered — #${body.props.orderId || "00000000"}`;
          html = await render(DeliveryConfirmation({
            buyerName: body.props.buyerName || "there",
            orderId: body.props.orderId || "00000000",
            productTitle: body.props.productTitle || "your order",
            orderUrl: body.props.orderUrl || "https://tradevault.io/orders",
          }));
          break;
        case "follow_up":
          subject = `How was your ${body.props.productTitle || "order"}?`;
          html = await render(FollowUpEmail({
            buyerName: body.props.buyerName || "there",
            orderId: body.props.orderId || "00000000",
            productTitle: body.props.productTitle || "your order",
            reviewUrl: body.props.reviewUrl || "https://tradevault.io/orders",
          }));
          break;
        case "price_drop":
          subject = `Price Drop Alert: ${body.props.productTitle || "a product"}`;
          html = await render(PriceDropEmail({
            buyerName: body.props.buyerName || "there",
            productTitle: body.props.productTitle || "a product",
            currentPrice: body.props.currentPrice || "$0.00",
            targetPrice: body.props.targetPrice || "$0.00",
            productUrl: body.props.productUrl || "https://tradevault.io/marketplace",
          }));
          break;
        case "low_stock":
          subject = `Low Stock Alert: ${body.props.productTitle || "your product"}`;
          html = `<html><body style="font-family:system-ui,sans-serif;background:#0B0F14;color:#E8ECF1;padding:24px;"><div style="max-width:480px;margin:0 auto;background:#111820;border:1px solid #232D3B;border-radius:8px;padding:24px;"><h1 style="font-size:18px;margin-bottom:8px;">Low Stock Warning</h1><p>Hi ${body.props.sellerName || "there"},</p><p>Your product <strong>${body.props.productTitle || "your product"}</strong> only has <strong style="color:#E05D5D;">${body.props.stockCount || "0"}</strong> keys remaining.</p><p style="margin-top:16px;"><a href="${body.props.restockUrl || "#"}" style="display:inline-block;background:#5B8EC8;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Restock Now</a></p><p style="margin-top:16px;font-size:12px;color:#8899AA;">— TradeVault Team</p></div></body></html>`;
          break;
        default:
          return res.status(400).json({ error: "Unknown template" });
      }
    } else {
      // Raw HTML email
      if (!body.subject || !body.html) {
        return res.status(400).json({ error: "Missing required fields: subject, html" });
      }
      subject = body.subject;
      html = body.html;
    }

    const { data, error } = await resend.emails.send({
      from: "TradeVault <noreply@tradevault.io>",
      to: body.to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res.status(200).json({ id: data?.id });
  } catch (err) {
    console.error("Send email error:", err);
    const message = err instanceof Error ? err.message : "Failed to send email";
    return res.status(500).json({ error: message });
  }
}