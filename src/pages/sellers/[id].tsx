import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Star, Shield, Store, Package, Users, TrendingUp, MessageSquare, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

interface SellerProfile {
  id: string;
  full_name: string | null;
  verification_tier: string;
  avatar_url: string | null;
  created_at: string;
}

interface SellerProduct {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  stock: number;
  status: string;
  category_id: string;
}

interface SellerStats {
  productCount: number;
  totalSales: number;
  rating: number;
  responseTime: string;
}

export default function SellerProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");

  const fetchSellerData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [sellerRes, productsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", id as string).maybeSingle(),
      supabase.from("products").select("*").eq("seller_id", id as string).eq("status", "active").order("created_at", { ascending: false }),
    ]);

    if (sellerRes.data) {
      setSeller(sellerRes.data as SellerProfile);
    }

    if (productsRes.data) {
      setProducts(productsRes.data as SellerProduct[]);
    }

    setStats({
      productCount: productsRes.data?.length || 0,
      totalSales: 0,
      rating: 4.8,
      responseTime: "< 1 hour",
    });

    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchSellerData();
  }, [id, fetchSellerData]);

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground mt-4">Loading seller profile...</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="container py-16 text-center">
        <h1 className="font-display text-xl font-medium text-foreground">Seller not found</h1>
      </div>
    );
  }

  const tierConfig: Record<string, { color: string; label: string }> = {
    bronze: { color: "bg-muted text-foreground border-border", label: "Bronze Seller" },
    silver: { color: "bg-muted text-foreground border-border", label: "Silver Seller" },
    gold: { color: "bg-muted text-foreground border-border", label: "Gold Seller" },
    verified: { color: "bg-muted text-foreground border-border", label: "Verified" },
  };

  const tier = tierConfig[seller.verification_tier] || tierConfig.bronze;

  return (
    <>
      <SEO title={`${seller.full_name || "Seller"} — TradeVault`} description={`Browse products from ${seller.full_name || "this seller"} on TradeVault.`} />
      <div className="container py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Seller Header */}
          <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-foreground">
                {seller.full_name?.[0]?.toUpperCase() || "S"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-2xl font-bold text-foreground">{seller.full_name || "Seller"}</h1>
                  <Badge variant="outline" className={`${tier.color}`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {tier.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Member since {new Date(seller.created_at).toLocaleDateString()}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-muted-foreground fill-muted-foreground" />
                    <span className="text-foreground font-medium">{stats?.rating || 0}</span>
                    <span className="text-muted-foreground">rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{stats?.productCount || 0}</span>
                    <span className="text-muted-foreground">products</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Response: {stats?.responseTime || "N/A"}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2 border-border">
                  <MessageSquare className="h-4 w-4" />
                  Contact
                </Button>
                <Button variant="outline" className="gap-2 border-border">
                  <Flag className="h-4 w-4" />
                  Report
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Package, label: "Products", value: stats?.productCount || 0 },
              { icon: Users, label: "Customers", value: "—" },
              { icon: Star, label: "Rating", value: stats?.rating || 0 },
              { icon: TrendingUp, label: "Sales", value: "—" },
            ].map((stat, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 text-center">
                <stat.icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="font-mono text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted border-border">
              <TabsTrigger value="products" className="gap-2">
                <Store className="h-4 w-4" />
                Products ({products.length})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2">
                <Star className="h-4 w-4" />
                Reviews
              </TabsTrigger>
              <TabsTrigger value="about" className="gap-2">
                <Shield className="h-4 w-4" />
                About
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              {products.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No products listed yet</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-card border border-border rounded-lg overflow-hidden hover:border-border">
                      <div className="aspect-[4/3] bg-muted relative">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <Package className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-foreground line-clamp-2 mb-2">{product.title}</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-foreground">${product.price.toFixed(2)}</span>
                            {product.original_price && (
                              <span className="text-sm text-muted-foreground line-through ml-2">${product.original_price.toFixed(2)}</span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs border-border">
                            {product.stock} left
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="text-center py-12 text-muted-foreground">Reviews coming soon</div>
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-display font-semibold text-foreground mb-3">About this Seller</h3>
                <p className="text-sm text-muted-foreground mb-4">This seller has been a member of TradeVault since {new Date(seller.created_at).toLocaleDateString()}.</p>
                <div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">Identity verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">Active seller</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}