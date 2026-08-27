import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Ban, Eye, CheckCircle, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FraudEvent {
  id: string;
  user_id: string;
  event_type: string;
  risk_score: number;
  details: Record<string, unknown>;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null };
}

export default function FraudDashboard() {
  const { toast } = useToast();
  const [events, setEvents] = useState<FraudEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, highRisk: 0, resolved: 0, blocked: 0 });

  useEffect(() => {
    async function fetchFraudEvents() {
      setLoading(true);
      const { data } = await supabase
        .from("fraud_alerts")
        .select("*, profiles:user_id(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        const typed = data.map((e: unknown) => {
          const row = e as Record<string, unknown>;
          return {
            id: String(row.id),
            user_id: String(row.user_id),
            event_type: String(row.alert_type || row.event_type || "unknown"),
            risk_score: Number(row.risk_score || 0),
            details: (row.details as Record<string, unknown>) || {},
            created_at: String(row.created_at),
            profiles: row.profiles as { full_name: string | null; email: string | null } | undefined,
          };
        });
        setEvents(typed);
        setStats({
          total: typed.length,
          highRisk: typed.filter((e) => e.risk_score >= 80).length,
          resolved: 0,
          blocked: typed.filter((e) => e.event_type === "user_blocked").length,
        });
      }
      setLoading(false);
    }
    fetchFraudEvents();
  }, []);

  async function resolveEvent(id: string) {
    const { error } = await supabase.from("fraud_alerts").update({ status: "resolved" }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event resolved" });
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  }

  async function blockUser(userId: string) {
    const { error } = await supabase.from("profiles").update({ role: "blocked" }).eq("id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User blocked", description: "User has been blocked from the platform." });
    }
  }

  return (
    <>
      <SEO title="Fraud Detection — Admin" description="Monitor and manage fraud alerts" />
      <div className="container py-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Fraud Detection
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Events</p>
            <p className="font-display text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">High Risk</p>
            <p className="font-display text-2xl font-bold text-foreground">{stats.highRisk}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Resolved</p>
            <p className="font-display text-2xl font-bold text-foreground">{stats.resolved}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Blocked</p>
            <p className="font-display text-2xl font-bold text-foreground">{stats.blocked}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No fraud events recorded</div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className={`bg-card border rounded-lg p-4 ${event.risk_score >= 80 ? "border-destructive" : "border-border"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={event.risk_score >= 80 ? "destructive" : event.risk_score >= 50 ? "outline" : "secondary"} className="text-xs">
                        {event.risk_score >= 80 ? "High Risk" : event.risk_score >= 50 ? "Medium Risk" : "Low Risk"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{event.event_type}</span>
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      {event.profiles?.full_name || "Unknown"} ({event.profiles?.email || "no email"})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Risk Score: {event.risk_score}/100 · {new Date(event.created_at).toLocaleString()}
                    </p>
                    {Object.keys(event.details).length > 0 && (
                      <pre className="mt-2 text-xs bg-muted rounded p-2 overflow-x-auto text-muted-foreground">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => resolveEvent(event.id)} className="gap-1 border-border">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Resolve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => blockUser(event.user_id)} className="gap-1 border-destructive text-destructive hover:bg-destructive/10">
                      <Ban className="h-3.5 w-3.5" />
                      Block
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}