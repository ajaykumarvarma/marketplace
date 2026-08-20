import { useState, useEffect } from "react";
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getFraudAlerts, resolveFraudAlert } from "@/services/fraudService";
import { supabase } from "@/integrations/supabase/client";

interface FraudAlert {
  id: string;
  alert_type: string;
  severity: string;
  description: string;
  status: string;
  created_at: string;
  user: { full_name: string | null; email: string | null } | null;
}

export default function FraudDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "critical">("all");

  useEffect(() => {
    if (!user) return;
    fetchAlerts();
  }, [user, filter]);

  async function fetchAlerts() {
    setLoading(true);
    const status = filter === "all" ? undefined : filter === "open" ? "open" : undefined;
    const { data } = await getFraudAlerts(status);
    let filtered = data;
    if (filter === "critical") {
      filtered = data.filter((a: any) => a.severity === "critical" || a.severity === "high");
    }
    setAlerts(filtered);
    setLoading(false);
  }

  async function handleResolve(alertId: string, status: "resolved" | "false_positive") {
    const { error } = await resolveFraudAlert(alertId, status, user!.id);
    if (error) {
      toast({ title: "Failed to update alert", variant: "destructive" });
    } else {
      toast({ title: `Alert marked as ${status}` });
      fetchAlerts();
    }
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div className="container py-12 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">Admin only.</p>
      </div>
    );
  }

  return (
    <>
      <SEO title="Fraud Detection — TradeVault Admin" />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">Fraud Detection</h1>
          <div className="flex gap-2">
            {(["all", "open", "critical"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 border border-border rounded-lg bg-card">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-lg font-semibold">No Alerts</h2>
            <p className="text-muted-foreground">All clear. No fraud alerts match your filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="border border-border rounded-lg bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={
                        alert.severity === "critical" ? "bg-muted text-foreground border-border" :
                        alert.severity === "high" ? "bg-muted text-foreground border-border" :
                        "bg-muted text-foreground border-border"
                      }>
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline">{alert.alert_type}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-foreground">{alert.description}</p>
                    {alert.user && (
                      <p className="text-xs text-muted-foreground mt-1">
                        User: {alert.user.full_name || alert.user.email}
                      </p>
                    )}
                  </div>
                  {alert.status === "open" && (
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleResolve(alert.id, "false_positive")}>
                        <XCircle className="h-4 w-4 mr-1" />
                        False Positive
                      </Button>
                      <Button size="sm" onClick={() => handleResolve(alert.id, "resolved")}>
                        <CheckCircle className="h-4 w-4 mr-1 text-muted-foreground" />
                        Resolve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}