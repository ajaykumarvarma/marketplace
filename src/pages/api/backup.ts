import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!supabaseServiceKey) {
    return res.status(500).json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const tables = [
      "profiles",
      "products",
      "orders",
      "order_files",
      "messages",
      "reviews",
      "fraud_alerts",
      "seller_analytics",
      "categories",
    ];

    const backup: Record<string, unknown[]> = {};
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .limit(10000);
      if (error) {
        console.error(`Backup error for ${table}:`, error);
        backup[table] = [];
      } else {
        backup[table] = data || [];
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${timestamp}.json`;
    const fileContent = JSON.stringify(backup, null, 2);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("backups")
      .upload(filename, fileContent, {
        contentType: "application/json",
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({
        error: "Failed to upload backup",
        details: uploadError.message,
      });
    }

    return res.status(200).json({
      success: true,
      filename,
      path: uploadData?.path,
      tablesBackedUp: tables.length,
      totalRows: Object.values(backup).reduce(
        (sum, rows) => sum + (rows as unknown[]).length,
        0
      ),
    });
  } catch (err) {
    console.error("Backup failed:", err);
    return res.status(500).json({
      error: "Backup failed",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
}