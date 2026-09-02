import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { rateLimitByIP } from "@/services/rateLimiter";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("Missing Supabase environment variables for API route");
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

// Sanitize search input to prevent SQL injection via special characters
function sanitizeSearch(input: string): string {
  return input.replace(/[%_\\]/g, "").trim().slice(0, 100);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting
  const clientIP = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "unknown";
  const rateLimit = await rateLimitByIP(clientIP);
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  try {
    const { category, search, sort, limit = "20", offset = "0" } = req.query;

    // Validate and clamp pagination params
    const parsedLimit = Math.min(Math.max(parseInt(limit as string) || 20, 1), 100);
    const parsedOffset = Math.max(parseInt(offset as string) || 0, 0);

    let query = supabaseAdmin
      .from("products")
      .select("*, seller:seller_id(id, full_name, role), category:category_id(name, slug)", { count: "exact" })
      .eq("status", "active");

    if (category && category !== "all") {
      // Validate category is alphanumeric to prevent injection
      const sanitizedCategory = String(category).replace(/[^a-zA-Z0-9-_]/g, "");
      if (sanitizedCategory) {
        query = query.eq("category_id", sanitizedCategory);
      }
    }

    if (search) {
      const sanitizedSearch = sanitizeSearch(String(search));
      if (sanitizedSearch.length > 0) {
        query = query.ilike("title", `%${sanitizedSearch}%`);
      }
    }

    if (sort === "price_low") query = query.order("price", { ascending: true });
    else if (sort === "price_high") query = query.order("price", { ascending: false });
    else if (sort === "rating") query = query.order("rating", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query.range(
      parsedOffset,
      parsedOffset + parsedLimit - 1
    );

    if (error) {
      console.error("Products API error:", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }

    return res.status(200).json({
      products: data ?? [],
      total: count ?? 0,
      limit: parsedLimit,
      offset: parsedOffset,
    });
  } catch (err) {
    console.error("Products API unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}