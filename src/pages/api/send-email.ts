import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { rateLimitByIP } from "@/services/rateLimiter";

const resend = new Resend(process.env.RESEND_API_KEY || "");

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting
  const clientIP = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "unknown";
  const rateLimit = await rateLimitByIP(clientIP);
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: "Too many requests" });
  }

  try {
    const { to, subject, html, from } = req.body as EmailRequest;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: "Missing required fields: to, subject, html" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const { data, error } = await resend.emails.send({
      from: from || "TradeVault <noreply@tradevault.io>",
      to,
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