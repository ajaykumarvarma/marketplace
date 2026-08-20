import { useState, useEffect } from "react";
import { Bell, Mail, Smartphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Channel = "email" | "push" | "sms";
type Category = "orders" | "messages" | "fraud" | "marketing" | "system";
type Frequency = "immediate" | "daily" | "weekly" | "never";

interface Preference {
  id: string;
  channel: Channel;
  category: Category;
  enabled: boolean;
  frequency: Frequency;
}

const CATEGORIES: { key: Category; label: string; description: string }[] = [
  { key: "orders", label: "Orders", description: "Order status, delivery, and payment updates" },
  { key: "messages", label: "Messages", description: "New messages from buyers or sellers" },
  { key: "fraud", label: "Security", description: "Suspicious activity and security alerts" },
  { key: "marketing", label: "Marketing", description: "Promotions, new features, and tips" },
  { key: "system", label: "System", description: "Platform updates and maintenance notices" },
];

const CHANNELS: { key: Channel; label: string; icon: React.ReactNode }[] = [
  { key: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
  { key: "push", label: "Push", icon: <Bell className="h-4 w-4" /> },
  { key: "sms", label: "SMS", icon: <Smartphone className="h-4 w-4" /> },
];

export default function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchPrefs();
  }, [user]);

  async function fetchPrefs() {
    setLoading(true);
    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user!.id);

    if (data && data.length > 0) {
      setPrefs(data as Preference[]);
    } else {
      // Create defaults
      const defaults: Omit<Preference, "id">[] = [];
      for (const cat of CATEGORIES) {
        for (const ch of CHANNELS) {
          defaults.push({
            channel: ch.key,
            category: cat.key,
            enabled: ch.key === "email" && cat.key !== "marketing",
            frequency: "immediate",
          });
        }
      }
      const { data: created } = await supabase
        .from("notification_preferences")
        .insert(defaults.map((d) => ({ ...d, user_id: user!.id })))
        .select();
      setPrefs((created as Preference[]) || []);
    }
    setLoading(false);
  }

  async function updatePref(id: string, enabled: boolean) {
    setSaving(true);
    await supabase.from("notification_preferences").update({ enabled }).eq("id", id);
    setPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, enabled } : p)));
    setSaving(false);
    toast({ title: "Preference updated" });
  }

  async function updateFrequency(id: string, frequency: Frequency) {
    setSaving(true);
    await supabase.from("notification_preferences").update({ frequency }).eq("id", id);
    setPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, frequency } : p)));
    setSaving(false);
  }

  const getPref = (category: Category, channel: Channel) =>
    prefs.find((p) => p.category === category && p.channel === channel);

  return (
    <>
      <SEO title="Notification Settings — TradeVault" />
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-2xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground mb-6">Control how and when you receive updates.</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {CATEGORIES.map((cat) => (
                <div key={cat.key} className="border border-border rounded-lg bg-card p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold">{cat.label}</h3>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                  <div className="space-y-3">
                    {CHANNELS.map((ch) => {
                      const pref = getPref(cat.key, ch.key);
                      if (!pref) return null;
                      return (
                        <div key={ch.key} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{ch.icon}</span>
                            <span className="text-sm">{ch.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Select
                              value={pref.frequency}
                              onValueChange={(v) => updateFrequency(pref.id, v as Frequency)}
                              disabled={!pref.enabled}
                            >
                              <SelectTrigger className="h-8 w-[120px] text-xs bg-muted border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="immediate">Immediate</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="never">Never</SelectItem>
                              </SelectContent>
                            </Select>
                            <Switch
                              checked={pref.enabled}
                              onCheckedChange={(v) => updatePref(pref.id, v)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}