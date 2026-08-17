import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { category, search, sort, limit = "20", offset = "0" } = req.query;

    let query = supabaseAdmin
      .from("products")
      .select("*, seller:seller_id(full_name), category:category_id(name, slug)", { count: "exact" })
      .eq("status", "active");

    if (category && category !== "all") {
      query = query.eq("category_id", category as string);
    }
    if (search) {
      query = query.ilike("title", `%${search}%`);
    }
    if (sort === "price_low") query = query.order("price", { ascending: true });
    else if (sort === "price_high") query = query.order("price", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query.range(
      parseInt(offset as string),
      parseInt(offset as string) + parseInt(limit as string) - 1
    );

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ products: data, total: count });
  }

  res.status(405).json({ error: "Method not allowed" });
}