import { useState } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, Users, ShoppingCart, DollarSign, Ban, Eye, CheckCircle, XCircle, TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";

const platformStats = [
  { label: "Total Users", value: "12,847", change: "+5.2%", icon: Users },
  { label: "Active Orders", value: "1,234", change: "+12.1%", icon: ShoppingCart },
  { label: "GMV (30d)", value: "$284,592", change: "+8.7%", icon: DollarSign },
  { label: "Fraud Score", value: "0.3%", change: "-0.1%", icon: Shield, good: true },
];

const fraudAlerts = [
  { id: "FRD-001", user: "SuspiciousUser99", type: "Velocity", risk: "high", reason: "5 orders in 2 minutes", time: "2 min ago", status: "open" },
  { id: "FRD-002", user: "QuickFlipper", type: "Chargeback", risk: "medium", reason: "Previous dispute filed", time: "15 min ago", status: "open" },
  { id: "FRD-003", user: "NewAccount_X", type: "Identity", risk: "high", reason: "VPN + new account + high value", time: "1 hr ago", status: "reviewing" },
  { id: "FRD-004", user: "LegitSeller", type: "Velocity", risk: "low", reason: "Unusual spike in sales", time: "3 hrs ago", status: "resolved" },
];

const users = [
  { id: "u-1", name: "GameVault", email: "support@gamevault.io", role: "seller", status: "active", joined: "2023-05-12", sales: 2847, risk: "low" },
  { id: "u-2", name: "SuspiciousUser99", email: "temp@mail.ru", role: "buyer", status: "flagged", joined: "2026-08-11", sales: 0, risk: "high" },
  { id: "u-3", name: "SubMaster", email: "hello@submaster.net", role: "seller", status: "active", joined: "2024-01-20", sales: 1523, risk: "low" },
  { id: "u-4", name: "QuickFlipper", email: "flip@proton.me", role: "buyer", status: "restricted", joined: "2025-11-03", sales: 12, risk: "medium" },
];

const riskColor = (risk: string) => {
  const map: Record<string, string> = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-warning/10 text-warning border-warning/20",
    low: "bg-success/10 text-success border-success/20",
  };
  return map[risk] || "bg-muted text-muted-foreground";
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      <SEO title="Admin Dashboard — TradeVault" description="Platform administration, fraud detection, and moderation." />
      <div className="container py-8 md:py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">Admin Command</h1>
            </div>
            <p className="text-muted-foreground">Fraud detection, user management, and platform analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
              <AlertTriangle className="h-3 w-3" />
              2 Open Alerts
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <stat.icon className="h-5 w-5 text-primary" />
                <span className={`text-xs font-medium ${stat.good ? "text-success" : "text-success"}`}>
                  {stat.change}
                </span>
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
            <TabsTrigger value="fraud" className="data-[state=active]:bg-card">Fraud Alerts</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-card">Users</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-card">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-foreground">Live Activity</h3>
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-success animate-pulse" />
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { event: "New order placed", detail: "Steam Game Keys — $12.99", time: "Just now", type: "order" },
                    { event: "Fraud alert triggered", detail: "SuspiciousUser99 — Velocity", time: "2 min ago", type: "fraud" },
                    { event: "Seller verified", detail: "GameVault completed KYC", time: "5 min ago", type: "verify" },
                    { event: "Dispute filed", detail: "ORD-7827 — Delivery issue", time: "12 min ago", type: "dispute" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${log.type === "fraud" ? "bg-destructive" : log.type === "dispute" ? "bg-warning" : "bg-success"}`} />
                      <div className="flex-1">
                        <p className="text-foreground">{log.event}</p>
                        <p className="text-muted-foreground text-xs">{log.detail}</p>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="font-display font-semibold text-foreground">Risk Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Low Risk</span>
                      <span className="font-mono text-success">94.2%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: "94.2%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Medium Risk</span>
                      <span className="font-mono text-warning">4.8%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-warning rounded-full" style={{ width: "4.8%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">High Risk</span>
                      <span className="font-mono text-destructive">1.0%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-destructive rounded-full" style={{ width: "1.0%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fraud" className="mt-4">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Alert ID</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Risk</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reason</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fraudAlerts.map((alert) => (
                      <tr key={alert.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-foreground">{alert.id}</td>
                        <td className="px-4 py-3 text-foreground">{alert.user}</td>
                        <td className="px-4 py-3 text-muted-foreground">{alert.type}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-xs ${riskColor(alert.risk)}`}>
                            {alert.risk}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{alert.reason}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-xs ${alert.status === "open" ? "bg-destructive/10 text-destructive" : alert.status === "reviewing" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                            {alert.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="text-muted-foreground hover:text-success" title="Approve">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button className="text-muted-foreground hover:text-destructive" title="Block">
                              <Ban className="h-4 w-4" />
                            </button>
                            <button className="text-muted-foreground hover:text-foreground" title="Review">
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sales</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Risk</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs capitalize border-border text-muted-foreground">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-xs ${user.status === "active" ? "bg-success/10 text-success" : user.status === "flagged" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{user.joined}</td>
                        <td className="px-4 py-3 font-mono text-foreground">{user.sales.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-xs ${riskColor(user.risk)}`}>
                            {user.risk}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="text-muted-foreground hover:text-foreground" title="View">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-muted-foreground hover:text-destructive" title="Ban">
                              <Ban className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display font-semibold text-foreground">Order Management</h3>
              <p className="text-sm text-muted-foreground mt-2">Full order moderation and refund tools coming in the next update.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}