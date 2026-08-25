import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

async function sendEmail(to: string, template: string, props: Record<string, string>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${siteUrl}/api/send-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, template, props }),
  });
  return res.ok;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch all active price alerts
    const { data: alerts } = await supabaseAdmin
      .from("price_alerts")
      .select("id, target_price, user:user_id(email, full_name), product:product_id(id, title, price)")
      .eq("notified", false);

    if (!alerts || alerts.length === 0) {
      return res.json({ checked: 0, notifications: 0 });
    }

    let notificationsSent = 0;

    for (const alert of alerts) {
      const product = (alert.product as Array<Record<string, unknown>>)?.[0];
      if (!product) continue;

      const currentPrice = Number(product.price || 0);
      const targetPrice = Number(alert.target_price || 0);

      if (currentPrice <= targetPrice) {
        const user = (alert.user as Array<Record<string, unknown>>)?.[0];
        if (user?.email) {
          await sendEmail(
            String(user.email),
            "price_drop",
            {
              buyerName: String(user.full_name || "there"),
              productTitle: String(product.title || "a product"),
              currentPrice: `$${currentPrice.toFixed(2)}`,
              targetPrice: `$${targetPrice.toFixed(2)}`,
              productUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://tradevault.io"}/marketplace/${product.id}`,
            }
          );
        }

        await supabaseAdmin
          .from("price_alerts")
          .update({ notified: true })
          .eq("id", alert.id);

        notificationsSent++;
      }
    }

    return res.json({ checked: alerts.length, notifications: notificationsSent });
  } catch (err) {
    console.error("Price alert check error:", err);
    return res.status(500).json({ error: "Price alert check failed" });
  }
}