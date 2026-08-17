import type { NextApiRequest, NextApiResponse } from "next";
import speakeasy from "speakeasy";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { secret, code } = req.body;
  const valid = speakeasy.totp.verify({ secret, encoding: "base32", token: code, window: 2 });

  if (!valid) return res.status(400).json({ error: "Invalid code" });

  res.status(200).json({ valid: true });
}