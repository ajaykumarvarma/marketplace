import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Store, Package, DollarSign, Star, ArrowUpRight, ArrowDownRight, Eye, ShoppingCart, BarChart3, Loader2, Inbox, Plus, ThumbsUp, EyeOff, Upload, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createNotification } from "@/services/notificationService";
import { SalesChart } from "@/components/analytics/SalesChart";
import { TopProductsChart } from "@/components/analytics/TopProductsChart";
import { RevenueStats } from "@/components/analytics/RevenueStats";
import { FileUploader } from "@/components/delivery/FileUploader";

type Order = { id: string; status: string; created_at: string; total_amount: number | null; product: { title: string } | null };
type Product = { id: string; title: string; price: number; stock: number; status: string };

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const [ordersPage, setOrdersPage] = useState(1);
  const ordersPerPage = 10;
  const [reviews, setReviews] = useState<Array<Record<string, unknown>>>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [fulfillModalOpen, setFulfillModalOpen] = useState(false);
  const [fulfillOrder, setFulfillOrder] = useState<Order | null>(null);
  const [deliveryText, setDeliveryText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; path: string; size: number; type: string }>>([]);
  const [fulfilling, setFulfilling] = useState(false);

  const paginatedOrders = orders.slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage);
  const totalOrderPages = Math.ceil(orders.length / ordersPerPage);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [ordersRes, productsRes, revenueRes] = await Promise.all([
      supabase.from("orders").select("id, status, created_at, total_amount, product:product_id(title)").eq("seller_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("products").select("id, title, price, stock, status").eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabase.from("orders").select("total_amount").eq("seller_id", user.id).eq("status", "completed"),
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
  }, [user]);

  const fetchReviews = useCallback(async () => {
    if (!user) return;
    setReviewsLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("id, rating, comment, created_at, approved, helpful_count, unhelpful_count, product:product_id(title), reviewer:reviewer_id(full_name)")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    setReviews((data as Array<Record<string, unknown>>) || []);
    setReviewsLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchDashboard();
    fetchReviews();
  }, [user, fetchDashboard, fetchReviews]);

  async function toggleReviewApproval(reviewId: string, currentApproved: boolean) {
    const { error } = await supabase
      .from("reviews")
      .update({ approved: !currentApproved })
      .eq("id", reviewId)
      .eq("seller_id", user?.id || "");

    if (error) {
      toast({ title: "Failed to update review", variant: "destructive" });
    } else {
      toast({ title: currentApproved ? "Review hidden" : "Review approved" });
      fetchReviews();
    }
  }

  function openFulfillModal(order: Order) {
    setFulfillOrder(order);
    setDeliveryText("");
    setUploadedFiles([]);
    setFulfillModalOpen(true);
  }

  async function submitFulfillment() {
    if (!fulfillOrder || !user) return;
    if (!deliveryText.trim() && uploadedFiles.length === 0) {
      toast({ title: "Delivery required", description: "Please enter delivery content or upload a file.", variant: "destructive" });
      return;
    }

    setFulfilling(true);

    // Update order status to delivered
    const { error: orderError } = await supabase
      .from("orders")
      .update({
        status: "delivered",
        delivery_method: "digital",
      })
      .eq("id", fulfillOrder.id)
      .eq("seller_id", user.id);

    if (orderError) {
      toast({ title: "Failed to fulfill order", description: orderError.message, variant: "destructive" });
      setFulfilling(false);
      return;
    }

    // Store uploaded files
    if (uploadedFiles.length > 0) {
      const fileInserts = uploadedFiles.map((file) => ({
        order_id: fulfillOrder.id,
        file_name: file.name,
        file_path: file.path,
        file_size: file.size,
        content_type: file.type,
      }));
      await supabase.from("order_files").insert(fileInserts);
    }

    // Notify buyer
    const { data: orderData } = await supabase
      .from("orders")
      .select("buyer_id")
      .eq("id", fulfillOrder.id)
      .maybeSingle();

    if (orderData) {
      await createNotification(
        orderData.buyer_id,
        "delivery",
        "Order Delivered",
        `Your order #${fulfillOrder.id.slice(0, 8)} has been delivered. Please confirm receipt.`,
        { orderId: fulfillOrder.id }
      );
    }

    toast({ title: "Order fulfilled!", description: "Buyer has been notified." });
    setFulfillModalOpen(false);
    setFulfillOrder(null);
    setDeliveryText("");
    setUploadedFiles([]);
    fetchDashboard();
    setFulfilling(false);
  }

  function handleFileUpload(fileInfo: { name: string; path: string; size: number; type: string }) {
    setUploadedFiles((prev) => [...prev, fileInfo]);
  }

  function removeUploadedFile(index: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      delivered: "bg-muted text-foreground border-border",
      completed: "bg-muted text-foreground border-border",
      pending: "bg-muted text-foreground border-border",
      processing: "bg-muted text-foreground border-border",
      disputed: "bg-muted text-foreground border-border",
      active: "bg-muted text-foreground border-border",
      low_stock: "bg-muted text-foreground border-border",
      out_of_stock: "bg-muted text-foreground border-border",
      paused: "bg-muted text-muted-foreground",
    };
    return map[status] || "bg-muted text-muted-foreground";
  };

  return (
    <>
      <SEO title="Seller Dashboard — TradeVault" description="Manage your products, orders, and analytics on TradeVault." />
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: `$${stats.revenue.toFixed(2)}`, change: "+12.5%", up: true, icon: DollarSign },
            { label: "Active Orders", value: stats.activeOrders.toString(), change: "+3", up: true, icon: ShoppingCart },
            { label: "Products", value: stats.productCount.toString(), change: "+2", up: true, icon: Package },
            { label: "Rating", value: stats.rating.toString(), change: "+0.1", up: true, icon: Star },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium flex items-center gap-0.5 text-foreground">
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
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-muted border border-border">
              <TabsTrigger value="orders" className="data-[state=active]:bg-card">Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-card">Products ({products.length})</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-card">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-card">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-4">
              {orders.length === 0 && !loading ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-lg font-medium text-foreground mb-2">No orders yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">When buyers purchase your products, orders will appear here.</p>
                  <Link href="/seller/products/new">
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="h-4 w-4" />
                      Add Your First Product
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted">
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order ID</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOrders.map((order) => (
                          <tr key={order.id} className="border-b border-border hover:bg-muted transition-colors">
                            <td className="px-4 py-3 font-mono text-foreground">{order.id.slice(0, 8).toUpperCase()}</td>
                            <td className="px-4 py-3 text-foreground">{order.product?.title || "Unknown"}</td>
                            <td className="px-4 py-3 font-mono text-foreground">{order.total_amount ? `$${order.total_amount.toFixed(2)}` : "—"}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={`text-xs ${statusBadge(order.status)}`}>{order.status}</Badge>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              {order.status === "paid" && (
                                <Button
                                  size="sm"
                                  onClick={() => openFulfillModal(order)}
                                  className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                                >
                                  <Upload className="h-3.5 w-3.5" />
                                  Fulfill
                                </Button>
                              )}
                              {order.status === "delivered" && (
                                <Badge variant="outline" className="text-xs bg-muted text-foreground border-border">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Awaiting Confirmation
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalOrderPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={ordersPage === 1}
                        onClick={() => setOrdersPage(p => p - 1)}
                        className="border-border"
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {ordersPage} of {totalOrderPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={ordersPage === totalOrderPages}
                        onClick={() => setOrdersPage(p => p + 1)}
                        className="border-border"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="products" className="mt-4">
              {products.length === 0 && !loading ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-lg font-medium text-foreground mb-2">No products listed</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start selling by adding your first digital product.</p>
                  <Link href="/seller/products/new">
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="h-4 w-4" />
                      Add Product
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted">
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stock</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b border-border hover:bg-muted transition-colors">
                            <td className="px-4 py-3 text-foreground">{product.title}</td>
                            <td className="px-4 py-3 font-mono text-foreground">${product.price.toFixed(2)}</td>
                            <td className="px-4 py-3 font-mono text-foreground">{product.stock}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={`text-xs ${statusBadge(product.status)}`}>{product.status.replace("_", " ")}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button className="h-9 w-9 flex items-center justify-center rounded-md border border-transparent hover:border-border text-muted-foreground hover:text-foreground" aria-label="View product">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="h-9 w-9 flex items-center justify-center rounded-md border border-transparent hover:border-border text-muted-foreground hover:text-foreground" aria-label="Analytics">
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
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              {reviews.length === 0 && !reviewsLoading ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-lg font-medium text-foreground mb-2">No reviews yet</h3>
                  <p className="text-sm text-muted-foreground">When buyers review your products, they will appear here.</p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted">
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Review</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rating</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Helpful</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.map((review) => (
                          <tr key={String(review.id)} className="border-b border-border hover:bg-muted transition-colors">
                            <td className="px-4 py-3">
                              <p className="text-foreground text-sm line-clamp-2">{String(review.comment)}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {((review.product as Record<string, unknown>)?.title as string) || "Product"} — {new Date(String(review.created_at)).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3.5 w-3.5 ${i < Number(review.rating) ? "fill-foreground text-foreground" : "text-muted"}`} />
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-foreground">
                              <div className="flex items-center gap-2">
                                <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground" />
                                {Number(review.helpful_count || 0)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={`text-xs ${review.approved !== false ? "bg-muted text-foreground border-border" : "bg-muted text-muted-foreground"}`}>
                                {review.approved !== false ? "Public" : "Hidden"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleReviewApproval(String(review.id), review.approved !== false)}
                                className="gap-1.5 border-border text-xs"
                              >
                                {review.approved !== false ? (
                                  <>
                                    <EyeOff className="h-3.5 w-3.5" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-3.5 w-3.5" />
                                    Approve
                                  </>
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <RevenueStats
                stats={{
                  totalRevenue: stats.revenue,
                  totalOrders: orders.length,
                  totalProducts: stats.productCount,
                  uniqueBuyers: 0,
                  revenueChange: 12.5,
                  ordersChange: 3,
                }}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <SalesChart data={orders.map((o) => ({ date: o.created_at, revenue: o.total_amount || 0, orders: 1 }))} />
                <TopProductsChart data={products.map((p) => ({ name: p.title, revenue: p.price * p.stock, sales: p.stock }))} />
              </div>
            </TabsContent>
          </Tabs>
        )}
        <Dialog open={fulfillModalOpen} onOpenChange={setFulfillModalOpen}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">Fulfill Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order</p>
                <p className="font-mono text-foreground">#{fulfillOrder?.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Product</p>
                <p className="text-foreground">{fulfillOrder?.product?.title || "Unknown"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Delivery Content</p>
                <Textarea
                  value={deliveryText}
                  onChange={(e) => setDeliveryText(e.target.value)}
                  placeholder="Enter license keys, account credentials, download links, or any delivery instructions..."
                  className="bg-muted border-border min-h-[120px]"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Attach Files</p>
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded mb-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground flex-1">{file.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeUploadedFile(i)} className="h-6 w-6">
                      <X className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <FileUploader onUpload={handleFileUpload} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={submitFulfillment}
                  disabled={fulfilling}
                  className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {fulfilling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Mark as Delivered
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setFulfillModalOpen(false)} className="border-border">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}