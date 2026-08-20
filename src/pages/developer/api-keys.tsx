import { useState, useEffect, useCallback } from "react";
import { Key, Copy, Trash2, Plus, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  rate_limit: number;
  last_used_at: string | null;
  created_at: string;
}

export default function ApiKeysPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, permissions, rate_limit, last_used_at, created_at")
      .eq("user_id", user.id)
      .eq("active", true)
      .order("created_at", { ascending: false });
    setKeys((data as ApiKey[]) || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    fetchKeys();
  }, [user, fetchKeys]);

  async function createKey() {
    if (!newKeyName.trim() || !user?.id) return;
    const prefix = `tv_live_${Math.random().toString(36).substring(2, 6)}`;
    const secret = `${prefix}_${Math.random().toString(36).substring(2, 34)}`;
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const { data, error } = await supabase.from("api_keys").insert({
      user_id: user.id,
      name: newKeyName,
      key_hash: hashHex,
      key_prefix: prefix,
      permissions: ["read:products", "read:orders"],
      rate_limit: 100,
    }).select().single();

    if (error) {
      toast({ title: "Failed to create key", variant: "destructive" });
    } else {
      setNewKeyValue(secret);
      setKeys((prev) => [data as ApiKey, ...prev]);
      toast({ title: "API key created" });
    }
  }

  async function revokeKey(id: string) {
    await supabase.from("api_keys").update({ active: false }).eq("id", id);
    setKeys((prev) => prev.filter((k) => k.id !== id));
    toast({ title: "API key revoked" });
  }

  function copyKey() {
    if (!newKeyValue) return;
    navigator.clipboard.writeText(newKeyValue);
    toast({ title: "Key copied to clipboard" });
  }

  return (
    <>
      <SEO title="API Keys — TradeVault Developer" />
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold">API Keys</h1>
              <p className="text-muted-foreground text-sm">Manage keys for the TradeVault REST API.</p>
            </div>
            <Button onClick={() => { setDialogOpen(true); setNewKeyValue(null); setNewKeyName(""); }} className="gap-2">
              <Plus className="h-4 w-4" />
              New Key
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-12 border border-border rounded-lg bg-card">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-lg font-semibold">No API Keys</h2>
              <p className="text-muted-foreground text-sm mb-4">Create a key to start using the TradeVault API.</p>
              <Button onClick={() => setDialogOpen(true)}>Create First Key</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div key={key.id} className="border border-border rounded-lg bg-card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{key.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{key.key_prefix}...••••</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : "Never used"}</span>
                        <span>{key.rate_limit} req/min</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => revokeKey(key.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create API Key</DialogTitle>
              </DialogHeader>
              {newKeyValue ? (
                <div className="space-y-4">
                  <div className="p-3 bg-muted border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Your API Key (copy now — shown once)</p>
                    <div className="flex gap-2">
                      <code className="flex-1 text-xs font-mono break-all">{newKeyValue}</code>
                      <Button size="sm" variant="outline" onClick={copyKey}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <AlertTriangle className="h-4 w-4 text-warning inline mr-1" />
                  <span className="text-xs text-muted-foreground">Store this key securely. It cannot be shown again.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Key Name</label>
                    <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g., Production Integration" />
                  </div>
                  <Button onClick={createKey} disabled={!newKeyName.trim()} className="w-full">Create Key</Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}