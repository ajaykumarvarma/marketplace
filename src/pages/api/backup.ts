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
    return res.status(401).json({ error: "Unauthorized: Missing Bearer token" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the token belongs to an admin user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

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
      "contact_tickets",
      "notification_preferences",
    ];

    const backup: Record<string, unknown[]> = {};
    let totalRows = 0;

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
        totalRows += (data || []).length;
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
      totalRows,
      createdBy: user.email,
    });
  } catch (err) {
    console.error("Backup failed:", err);
    return res.status(500).json({
      error: "Backup failed",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
}