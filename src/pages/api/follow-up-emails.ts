import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security: require a secret cron key
  const cronSecret = req.headers["x-cron-secret"];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Find orders delivered 3+ days ago that haven't had follow-up sent
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(`
        id, buyer_id, product:product_id(title),
        buyer:buyer_id(email, full_name)
      `)
      .eq("status", "completed")
      .eq("followup_sent", false)
      .lte("delivered_at", threeDaysAgo)
      .limit(100);

    if (error) {
      console.error("Failed to fetch orders for follow-up:", error);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }

    let sent = 0;
    let failed = 0;

    for (const order of orders || []) {
      const buyerEmail = (order.buyer as { email?: string })?.email;
      const buyerName = (order.buyer as { full_name?: string })?.full_name || "there";
      const productTitle = (order.product as { title?: string })?.title || "your order";

      if (!buyerEmail) {
        failed++;
        continue;
      }

      try {
        const reviewUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://tradevault.io"}/orders/${order.id}`;

        const emailRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: buyerEmail,
            template: "follow_up",
            props: {
              buyerName,
              orderId: (order.id as string).slice(0, 8),
              productTitle,
              reviewUrl,
            },
          }),
        });

        if (emailRes.ok) {
          // Mark follow-up as sent
          await supabaseAdmin
            .from("orders")
            .update({ followup_sent: true })
            .eq("id", order.id);
          sent++;
        } else {
          failed++;
        }
      } catch (err) {
        console.error(`Failed to send follow-up for order ${order.id}:`, err);
        failed++;
      }
    }

    return res.status(200).json({ sent, failed, total: (orders || []).length });
  } catch (err) {
    console.error("Follow-up cron error:", err);
    return res.status(500).json({ error: "Cron job failed" });
  }
}