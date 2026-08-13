import { supabase } from "@/integrations/supabase/client";

export async function createNotification(
  userId: string,
  type: "order" | "message" | "fraud" | "system" | "delivery",
  title: string,
  message: string,
  data?: Record<string, unknown>
) {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    data: (data || null) as any,
    read: false,
  });

  return { error };
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  return { error };
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  return error ? 0 : (count || 0);
}

export async function getNotifications(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data: data || [], error };
}