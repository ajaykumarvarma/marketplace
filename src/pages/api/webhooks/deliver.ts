import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = generateSignature(payload, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

async function deliverWebhook(hook: { id: string; url: string; secret: string }, event: string, payload: unknown, attempt: number = 1): Promise<{ success: boolean; status: number; error?: string }> {
  const maxRetries = 3;
  const baseDelay = 1000;

  const body = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    data: payload,
  });

  const signature = generateSignature(body, hook.secret);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(hook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": event,
        "X-Webhook-Attempt": String(attempt),
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseBody = await response.text().catch(() => "");

    await supabaseAdmin.from("webhook_deliveries").insert({
      webhook_id: hook.id,
      event_type: event,
      payload,
      status_code: response.status,
      success: response.ok,
      response_body: responseBody.slice(0, 10000), // Limit response size
      attempt_number: attempt,
    });

    if (!response.ok && attempt < maxRetries) {
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
      return deliverWebhook(hook, event, payload, attempt + 1);
    }

    return { success: response.ok, status: response.status };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Network error";

    await supabaseAdmin.from("webhook_deliveries").insert({
      webhook_id: hook.id,
      event_type: event,
      payload,
      status_code: 0,
      success: false,
      response_body: errorMessage,
      attempt_number: attempt,
    });

    if (attempt < maxRetries) {
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
      return deliverWebhook(hook, event, payload, attempt + 1);
    }

    return { success: false, status: 0, error: errorMessage };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { event, payload } = req.body;

  if (!event || !payload) {
    return res.status(400).json({ error: "Missing event or payload" });
  }

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
    const result = await deliverWebhook(hook, event, payload);
    results.push({ url: hook.url, ...result });
  }

  res.status(200).json({
    delivered: results.filter((r) => r.success).length,
    total: results.length,
    results,
  });
}