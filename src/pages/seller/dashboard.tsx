import { useState } from "react";
import Link from "next/link";
import { Store, TrendingUp, Package, DollarSign, Users, Star, ArrowUpRight, ArrowDownRight, Eye, ShoppingCart, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";

const stats = [
  { label: "Total Revenue", value: "$12,847.50", change: "+12.5%", up: true, icon: DollarSign },
  { label: "Active Orders", value: "23", change: "+3", up: true, icon: ShoppingCart },
  { label: "Products", value: "47", change: "+2", up: true, icon: Package },
  { label: "Rating", value: "4.9", change: "+0.1", up: true, icon: Star },
];

const recentOrders = [
  { id: "ORD-7829", product: "Steam Game Keys Bundle", buyer: "AlexM", amount: 12.99, status: "delivered", date: "2 min ago" },
  { id: "ORD-7828", product: "Spotify Premium 12M", buyer: "JessicaT", amount: 24.99, status: "pending", date: "15 min ago" },
  { id: "ORD-7827", product: "Discord Nitro 1Y", buyer: "DavidL", amount: 34.99, status: "dispute", date: "1 hr ago" },
  { id: "ORD-7826", product: "Canva Pro Lifetime", buyer: "SarahK", amount: 19.99, status: "delivered", date: "3 hrs ago" },
  { id: "ORD-7825", product: "Fortnite OG Account", buyer: "MikeR", amount: 149.99, status: "pending", date: "5 hrs ago" },
];

const products = [
  { id: "prod-1", title: "Steam Game Keys Bundle", price: 12.99, stock: 47, sales: 2847, status: "active" },
  { id: "prod-2", title: "Spotify Premium 12M", price: 24.99, stock: 23, sales: 1523, status: "active" },
  { id: "prod-3", title: "Adobe Creative Cloud", price: 89.99, stock: 8, sales: 892, status: "low_stock" },
  { id: "prod-4", title: "Discord Nitro 1Y", price: 34.99, stock: 0, sales: 3421, status: "out_of_stock" },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    delivered: "bg-success/10 text-success border-success/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    dispute: "bg-destructive/10 text-destructive border-destructive/20",
    active: "bg-success/10 text-success border-success/20",
    low_stock: "bg-warning/10 text-warning border-warning/20",
    out_of_stock: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return map[status] || "bg-muted text-muted-foreground";
};

export default function SellerDashboardPage() {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <>
      <SEO title="Seller Dashboard — TradeVault" description="Manage your products, orders, and analytics on TradeVault." />
      <div className="container py-8 md:py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Seller Dashboard</h1>
            <p className="text-muted-foreground">Manage your shop, track orders, and grow your business</p>
          </div>
          <Link href="/seller/products/new">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Store className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <stat.icon className="h-5 w-5 text-primary" />
                <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? "text-success" : "text-destructive"}`}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
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
            <TabsTrigger value="orders" className="data-[state=active]:bg-card">Orders</TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-card">Products</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-card">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order ID</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Buyer</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-foreground">{order.id}</td>
                        <td className="px-4 py-3 text-foreground">{order.product}</td>
                        <td className="px-4 py-3 text-muted-foreground">{order.buyer}</td>
                        <td className="px-4 py-3 font-mono text-foreground">${order.amount.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-xs ${statusBadge(order.status)}`}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-4">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stock</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sales</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-foreground">{product.title}</td>
                        <td className="px-4 py-3 font-mono text-foreground">${product.price.toFixed(2)}</td>
                        <td className="px-4 py-3 font-mono text-foreground">{product.stock}</td>
                        <td className="px-4 py-3 font-mono text-foreground">{product.sales.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-xs ${statusBadge(product.status)}`}>
                            {product.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="View product">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors" aria-label="Analytics">
                              <BarChart3 className="h-4 w-4" />
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

          <TabsContent value="analytics" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="font-display font-semibold text-foreground">Revenue Overview</h3>
                <div className="h-48 flex items-end gap-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors relative group">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                        ${h * 120}
                      </div>
                      <div style={{ height: `${h}%` }} className="bg-primary/60 rounded-t-sm" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                  <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="font-display font-semibold text-foreground">Top Performing Products</h3>
                <div className="space-y-3">
                  {products.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground w-4">{i + 1}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(p.sales / 3500) * 100}%` }} />
                      </div>
                      <span className="font-mono text-xs text-foreground w-12 text-right">{p.sales}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}