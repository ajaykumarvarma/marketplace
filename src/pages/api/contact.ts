import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { rateLimitByIP } from "@/services/rateLimiter";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}

// Simple email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Sanitize input to prevent XSS
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 2000);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  // Rate limiting
  const clientIP = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "unknown";
  const rateLimit = await rateLimitByIP(clientIP);
  if (!rateLimit.allowed) {
    return res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
  }

  try {
    const { name, email, subject, message } = req.body as ContactRequest;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }

    const sanitizedName = sanitizeInput(name).slice(0, 100);
    const sanitizedEmail = sanitizeInput(email).slice(0, 255).toLowerCase();
    const sanitizedSubject = sanitizeInput(subject).slice(0, 200);
    const sanitizedMessage = sanitizeInput(message);

    if (sanitizedMessage.length < 10) {
      return res.status(400).json({ success: false, message: "Message must be at least 10 characters" });
    }

    // Generate ticket ID
    const ticketId = `TV-${Date.now().toString(36).toUpperCase()}`;

    // Store in Supabase
    const { error } = await supabaseAdmin.from("contact_tickets").insert({
      ticket_id: ticketId,
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      ip_address: clientIP,
      status: "open",
    });

    if (error) {
      console.error("Contact ticket insert error:", error);
      return res.status(500).json({ success: false, message: "Failed to submit ticket. Please try again." });
    }

    return res.status(200).json({
      success: true,
      message: "Support ticket submitted successfully",
      ticketId,
    });
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}