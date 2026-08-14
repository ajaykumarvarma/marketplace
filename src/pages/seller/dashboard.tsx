import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, TrendingUp, Package, DollarSign, Star, ArrowUpRight, ArrowDownRight, Eye, ShoppingCart, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Order = { id: string; status: string; created_at: string; total_amount: number | null; product: { title: string } | null };
type Product = { id: string; title: string; price: number; stock: number; status: string };

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    revenue: 0,
    activeOrders: 0,
    productCount: 0,
    rating: 4.9,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchDashboard();
  }, [user]);

  async function fetchDashboard() {
    setLoading(true);
    const [ordersRes, productsRes, revenueRes] = await Promise.all([
      supabase.from("orders").select("id, status, created_at, total_amount, product:product_id(title)").eq("seller_id", user!.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("products").select("id, title, price, stock, status").eq("seller_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("orders").select("total_amount").eq("seller_id", user!.id).eq("status", "completed"),
    ]);

    if (ordersRes.data) setOrders(ordersRes.data as unknown as Order[]);
    if (productsRes.data) {
      setProducts(productsRes.data);
      const revenue = revenueRes.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const activeOrders = ordersRes.data?.filter((o) => ["pending", "processing"].includes(o.status)).length || 0;
      setStats({
        revenue,
        activeOrders,
        productCount: productsRes.data.length,
        rating: 4.9,
      });
    }
    setLoading(false);
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      delivered: "bg-success/10 text-success border-success/20",
      completed: "bg-success/10 text-success border-success/20",
      pending: "bg-warning/10 text-warning border-warning/20",
      processing: "bg-primary/10 text-primary border-primary/20",
      disputed: "bg-destructive/10 text-destructive border-destructive/20",
      active: "bg-success/10 text-success border-success/20",
      low_stock: "bg-warning/10 text-warning border-warning/20",
      out_of_stock: "bg-destructive/10 text-destructive border-destructive/20",
      paused: "bg-muted text-muted-foreground",
    };
    return map[status] || "bg-muted text-muted-foreground";
  };

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
          {[
            { label: "Total Revenue", value: `$${stats.revenue.toFixed(2)}`, change: "+12.5%", up: true, icon: DollarSign },
            { label: "Active Orders", value: stats.activeOrders.toString(), change: "+3", up: true, icon: ShoppingCart },
            { label: "Products", value: stats.productCount.toString(), change: "+2", up: true, icon: Package },
            { label: "Rating", value: stats.rating.toString(), change: "+0.1", up: true, icon: Star },
          ].map((stat) => (
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-muted border border-border">
              <TabsTrigger value="orders" className="data-[state=active]:bg-card">Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-card">Products ({products.length})</TabsTrigger>
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
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-foreground">{order.id.slice(0, 8).toUpperCase()}</td>
                          <td className="px-4 py-3 text-foreground">{order.product?.title || "Unknown"}</td>
                          <td className="px-4 py-3 font-mono text-foreground">{order.total_amount ? `$${order.total_amount.toFixed(2)}` : "—"}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${statusBadge(order.status)}`}>{order.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
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
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${statusBadge(product.status)}`}>{product.status.replace("_", " ")}</Badge>
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
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    Revenue analytics will appear as orders come in.
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <h3 className="font-display font-semibold text-foreground">Top Performing Products</h3>
                  <div className="space-y-3">
                    {products.slice(0, 5).map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground w-4">{i + 1}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((p.stock / 100) * 100, 100)}%` }} />
                        </div>
                        <span className="font-mono text-xs text-foreground w-12 text-right">{p.stock}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}