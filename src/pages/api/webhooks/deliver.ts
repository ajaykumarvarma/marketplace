import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { event, payload } = req.body;

  const { data: hooks } = await supabaseAdmin
    .from("webhooks")
    .select("*")
    .eq("active", true)
    .eq("event_type", event);

  if (!hooks || hooks.length === 0) {
    return res.status(200).json({ delivered: 0 });
  }

  const results = [];
  for (const hook of hooks) {
    try {
      const response = await fetch(hook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": hook.secret,
          "X-Webhook-Event": event,
        },
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          data: payload,
        }),
      });

      await supabaseAdmin.from("webhook_deliveries").insert({
        webhook_id: hook.id,
        event_type: event,
        payload,
        status_code: response.status,
        success: response.ok,
        response_body: await response.text().catch(() => ""),
      });

      results.push({ url: hook.url, success: response.ok, status: response.status });
    } catch (err) {
      await supabaseAdmin.from("webhook_deliveries").insert({
        webhook_id: hook.id,
        event_type: event,
        payload,
        status_code: 0,
        success: false,
        response_body: err instanceof Error ? err.message : "Network error",
      });
      results.push({ url: hook.url, success: false, error: err instanceof Error ? err.message : "Network error" });
    }
  }

  res.status(200).json({ delivered: results.filter((r) => r.success).length, total: results.length, results });
}