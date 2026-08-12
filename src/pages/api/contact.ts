import type { NextApiRequest, NextApiResponse } from "next";

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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { name, email, subject, message } = req.body as ContactRequest;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Generate a mock ticket ID
    const ticketId = `TV-${Date.now().toString(36).toUpperCase()}`;

    // In production, this would send to Supabase or an email service
    // For now, we return success with the ticket ID
    return res.status(200).json({
      success: true,
      message: "Support ticket submitted successfully",
      ticketId,
    });
  } catch {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}