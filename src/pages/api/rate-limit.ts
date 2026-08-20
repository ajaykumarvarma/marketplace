import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimitByIP, rateLimitAuth } from "@/services/rateLimiter";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: Return client IP for fraud detection
  if (req.method === "GET") {
    const clientIP = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "unknown";
    return res.status(200).json({ ip: clientIP });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { action, identifier } = req.body as { action: string; identifier: string };

    if (!identifier || !action) {
      return res.status(400).json({ error: "Missing identifier or action" });
    }

    let result;
    if (action === "auth") {
      result = await rateLimitAuth(identifier);
    } else if (action === "ip") {
      result = await rateLimitByIP(identifier);
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    if (!result.allowed) {
      const retryAfter = result.locked ? 1800 : 60;
      return res.status(429).json({
        error: result.locked ? "Account temporarily locked due to too many failed attempts" : "Too many requests",
        locked: result.locked,
        retryAfter,
      });
    }

    return res.status(200).json({ allowed: true, remaining: result.remaining });
  } catch (err) {
    console.error("Rate limit API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}