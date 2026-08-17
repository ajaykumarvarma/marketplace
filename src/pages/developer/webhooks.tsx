import { useState, useEffect } from "react";
import { Webhook, Plus, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const WEBHOOK_EVENTS = [
  "order.created",
  "order.paid",
  "order.delivered",
  "order.disputed",
  "product.created",
  "product.updated",
  "review.created",
  "fraud.alert",
];

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  last_status: number | null;
  failure_count: number;
  created_at: string;
}

export default function WebhooksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: [] as string[] });

  useEffect(() => {
    if (!user) return;
    fetchWebhooks();
  }, [user]);

  async function fetchWebhooks() {
    setLoading(true);
    const { data } = await supabase
      .from("webhooks")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setWebhooks((data as WebhookConfig[]) || []);
    setLoading(false);
  }

  async function createWebhook() {
    if (!newWebhook.name.trim() || !newWebhook.url.trim()) return;
    const { data, error } = await supabase.from("webhooks").insert({
      user_id: user!.id,
      name: newWebhook.name,
      url: newWebhook.url,
      secret: `whsec_${Math.random().toString(36).substring(2, 18)}`,
      events: newWebhook.events,
    }).select().single();

    if (error) {
      toast({ title: "Failed to create webhook", variant: "destructive" });
    } else {
      setWebhooks((prev) => [data as WebhookConfig, ...prev]);
      setDialogOpen(false);
      setNewWebhook({ name: "", url: "", events: [] });
      toast({ title: "Webhook created" });
    }
  }

  async function deleteWebhook(id: string) {
    await supabase.from("webhooks").delete().eq("id", id);
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    toast({ title: "Webhook deleted" });
  }

  function toggleEvent(event: string) {
    setNewWebhook((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  }

  return (
    <>
      <SEO title="Webhooks — TradeVault Developer" />
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold">Webhooks</h1>
              <p className="text-foreground/70 text-sm">Subscribe to platform events for real-time integrations.</p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Webhook
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-12 border border-border rounded-lg bg-card">
              <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-lg font-semibold">No Webhooks</h2>
              <p className="text-foreground/70 text-sm mb-4">Add a webhook to receive real-time event notifications.</p>
              <Button onClick={() => setDialogOpen(true)}>Add First Webhook</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks.map((wh) => (
                <div key={wh.id} className="border border-border rounded-lg bg-card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{wh.name}</h3>
                        {wh.active ? (
                          <span className="text-xs text-success flex items-center gap-1"><Check className="h-3 w-3" /> Active</span>
                        ) : (
                          <span className="text-xs text-destructive flex items-center gap-1"><X className="h-3 w-3" /> Inactive</span>
                        )}
                      </div>
                      <p className="text-xs text-foreground/50 font-mono mt-1">{wh.url}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {wh.events.map((e) => (
                          <span key={e} className="text-xs px-2 py-0.5 rounded bg-muted text-foreground/70">{e}</span>
                        ))}
                      </div>
                      {wh.failure_count > 0 && (
                        <p className="text-xs text-warning mt-1">{wh.failure_count} failed deliveries</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteWebhook(wh.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Webhook</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <Input value={newWebhook.name} onChange={(e) => setNewWebhook((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Order Notifications" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Endpoint URL</label>
                  <Input value={newWebhook.url} onChange={(e) => setNewWebhook((p) => ({ ...p, url: e.target.value }))} placeholder="https://your-app.com/webhooks/tradevault" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Events</label>
                  <div className="flex flex-wrap gap-2">
                    {WEBHOOK_EVENTS.map((e) => (
                      <Button
                        key={e}
                        variant={newWebhook.events.includes(e) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleEvent(e)}
                      >
                        {e}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button onClick={createWebhook} disabled={!newWebhook.name.trim() || !newWebhook.url.trim() || newWebhook.events.length === 0} className="w-full">
                  Create Webhook
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}