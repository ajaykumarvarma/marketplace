import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, Users, ShoppingCart, DollarSign, Ban, Eye, CheckCircle, XCircle, TrendingUp, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FraudLog {
  id: string;
  user_id: string;
  event_type: string;
  risk_score: number;
  reason: string;
  metadata: { ip_address?: string; device_fingerprint?: string } | null;
  created_at: string;
  reviewed_at: string | null;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  role: string;
  verification_tier: string;
  created_at: string;
}

interface OrderStats {
  total_orders: number;
  total_revenue: number;
  active_orders: number;
}

const riskColor = (risk: number) => {
  if (risk >= 70) return "bg-destructive/10 text-destructive border-destructive/20";
  if (risk >= 40) return "bg-warning/10 text-warning border-warning/20";
  return "bg-success/10 text-success border-success/20";
};

export default function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [fraudLogs, setFraudLogs] = useState<FraudLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<OrderStats>({ total_orders: 0, total_revenue: 0, active_orders: 0 });
  const [loading, setLoading] = useState(true);
  const [liveOrders, setLiveOrders] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    loadDashboard();
    
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        loadDashboard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  async function loadDashboard() {
    setLoading(true);
    const [fraudRes, usersRes, ordersRes] = await Promise.all([
      supabase.from("fraud_logs").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("profiles").select("id, full_name, role, verification_tier, created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("orders").select("status, total_amount"),
    ]);

    if (fraudRes.data) setFraudLogs(fraudRes.data as FraudLog[]);
    if (usersRes.data) setUsers(usersRes.data as UserProfile[]);
    
    if (ordersRes.data) {
      const totalRevenue = ordersRes.data.reduce((s, o) => s + Number(o.total_amount || 0), 0);
      const active = ordersRes.data.filter((o) => ["pending", "processing"].includes(o.status)).length;
      setStats({
        total_orders: ordersRes.data.length,
        total_revenue: totalRevenue,
        active_orders: active,
      });
      setLiveOrders(ordersRes.data.length);
    }
    
    setLoading(false);
  }

  async function resolveFraud(logId: string) {
    await supabase.from("fraud_logs").update({ reviewed_at: new Date().toISOString() }).eq("id", logId);
    loadDashboard();
  }

  if (!isAdmin) {
    return (
      <div className="container py-16 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-xl font-medium text-foreground">Access Denied</h1>
        <p className="text-muted-foreground mt-2">Admin access required</p>
      </div>
    );
  }

  const openAlerts = fraudLogs.filter((f) => !f.reviewed_at).length;

  return (
    <>
      <SEO title="Admin Dashboard — TradeVault" description="Platform administration, fraud detection, and moderation." />
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">Admin Command</h1>
            </div>
            <p className="text-muted-foreground">Fraud detection, user management, and platform analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`gap-1 ${openAlerts > 0 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-success/10 text-success border-success/20"}`}>
              <AlertTriangle className="h-3 w-3" />
              {openAlerts} Open Alert{openAlerts !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: users.length.toLocaleString(), icon: Users },
            { label: "Active Orders", value: stats.active_orders.toLocaleString(), icon: ShoppingCart },
            { label: "GMV (All Time)", value: `$${stats.total_revenue.toLocaleString()}`, icon: DollarSign },
            { label: "Fraud Score", value: fraudLogs.length > 0 ? `${(fraudLogs.filter((f) => !f.reviewed_at).length / fraudLogs.length * 100).toFixed(1)}%` : "0%", icon: Shield, good: true },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="h-5 w-5 text-primary" />
                {stat.good && <span className="text-xs font-medium text-success">Resolved</span>}
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-card">Overview</TabsTrigger>
            <TabsTrigger value="fraud" className="data-[state=active]:bg-card">Fraud Alerts ({openAlerts})</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-card">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-card">Orders ({stats.total_orders})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-foreground">Live Activity</h3>
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-success" />
                    <span className="text-xs text-muted-foreground font-mono">{liveOrders} orders</span>
                  </div>
                </div>
                {loading ? (
                  <div>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded mb-3" />
                    ))}
                  </div>
                ) : (
                  <div>
                    {fraudLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-start gap-3 text-sm mb-3">
                        <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${log.risk_score >= 70 ? "bg-destructive" : log.risk_score >= 40 ? "bg-warning" : "bg-success"}`} />
                        <div className="flex-1">
                          <p className="text-foreground">{log.event_type.toUpperCase()} — Risk: {log.risk_score}</p>
                          <p className="text-muted-foreground text-xs">{log.reason.slice(0, 80)}...</p>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                    ))}
                    {fraudLogs.length === 0 && <p className="text-muted-foreground text-sm">No recent activity</p>}
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-display font-semibold text-foreground mb-4">Risk Distribution</h3>
                {(() => {
                  const high = fraudLogs.filter((f) => f.risk_score >= 70).length;
                  const med = fraudLogs.filter((f) => f.risk_score >= 40 && f.risk_score < 70).length;
                  const low = fraudLogs.filter((f) => f.risk_score < 40).length;
                  const total = fraudLogs.length || 1;
                  return (
                    <div>
                      {[
                        { label: "Low Risk", count: low, pct: (low / total * 100).toFixed(1), color: "bg-success" },
                        { label: "Medium Risk", count: med, pct: (med / total * 100).toFixed(1), color: "bg-warning" },
                        { label: "High Risk", count: high, pct: (high / total * 100).toFixed(1), color: "bg-destructive" },
                      ].map((r) => (
                        <div key={r.label} className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">{r.label} ({r.count})</span>
                            <span className="font-mono text-foreground">{r.pct}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fraud" className="mt-4">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Risk</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reason</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fraudLogs.map((log) => (
                      <tr key={log.id} className="border-b border-border hover:bg-card">
                        <td className="px-4 py-3 text-foreground capitalize">{log.event_type}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-xs ${riskColor(log.risk_score)}`}>
                            {log.risk_score}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[250px] truncate">{log.reason}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-xs ${log.reviewed_at ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                            {log.reviewed_at ? "Resolved" : "Open"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {!log.reviewed_at && (
                              <button onClick={() => resolveFraud(log.id)} className="h-9 w-9 flex items-center justify-center rounded-md border border-transparent hover:border-primary/30 text-muted-foreground hover:text-success" title="Resolve" aria-label="Resolve alert">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button className="h-9 w-9 flex items-center justify-center rounded-md border border-transparent hover:border-primary/30 text-muted-foreground hover:text-destructive" title="Block User" aria-label="Block user">
                              <Ban className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {fraudLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No fraud alerts recorded</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tier</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-card">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-foreground">{user.full_name || "Anonymous"}</p>
                            <p className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 12)}...</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs capitalize border-border text-muted-foreground">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-xs capitalize ${user.verification_tier === "gold" ? "bg-warning/10 text-warning" : user.verification_tier === "silver" ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"}`}>
                            {user.verification_tier}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button className="h-9 w-9 flex items-center justify-center rounded-md border border-transparent hover:border-primary/30 text-muted-foreground hover:text-foreground" title="View" aria-label="View user">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="h-9 w-9 flex items-center justify-center rounded-md border border-transparent hover:border-primary/30 text-muted-foreground hover:text-destructive" title="Ban" aria-label="Ban user">
                              <Ban className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display font-semibold text-foreground">{stats.total_orders.toLocaleString()} Total Orders</h3>
              <p className="text-sm text-muted-foreground mt-2">Full order moderation tools available in the database console.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}