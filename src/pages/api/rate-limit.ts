import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimitByIP, rateLimitAuth } from "@/services/rateLimiter";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, identifier } = req.body as { action: string; identifier: string };

  let result;
  if (action === "auth") {
    result = rateLimitAuth(identifier);
  } else if (action === "ip") {
    result = rateLimitByIP(identifier);
  } else {
    return res.status(400).json({ error: "Invalid action" });
  }

  if (!result.allowed) {
    return res.status(429).json({
      error: "Too many requests",
      retryAfter: Math.ceil(result.remaining / 1000),
    });
  }

  return res.status(200).json({ allowed: true, remaining: result.remaining });
}