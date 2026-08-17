import type { NextApiRequest, NextApiResponse } from "next";
import speakeasy from "speakeasy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body;
  const secret = speakeasy.generateSecret({
    name: `TradeVault (${email || "user"})`,
    length: 32,
  });

  res.status(200).json({
    secret: secret.base32,
    otpauth_url: secret.otpauth_url,
  });
}