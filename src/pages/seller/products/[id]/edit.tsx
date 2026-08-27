import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("Instant");
  const [tags, setTags] = useState("");
  const [autoDelivery, setAutoDelivery] = useState(false);
  const [newStockKeys, setNewStockKeys] = useState("");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    async function load() {
      if (!id || !user) return;
      const [{ data: product }, { data: cats }] = await Promise.all([
        supabase.from("products").select("*").eq("id", id as string).eq("seller_id", user.id).maybeSingle(),
        supabase.from("categories").select("id, name").order("name"),
      ]);
      if (product) {
        setTitle(product.title || "");
        setDescription(product.description || "");
        setPrice(String(product.price || ""));
        setOriginalPrice(product.original_price ? String(product.original_price) : "");
        setCategoryId(product.category_id || "");
        setImageUrl(product.image_url || "");
        setStock(String(product.stock || ""));
        setDeliveryTime(product.delivery_time || "Instant");
        setTags((product.tags || []).join(", "));
        setAutoDelivery(product.auto_delivery || false);
      } else {
        toast({ title: "Product not found", variant: "destructive" });
        router.push("/seller/dashboard");
      }
      if (cats) setCategories(cats);
      setLoading(false);
    }
    load();
  }, [id, user, router, toast]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !id) return;
    setSaving(true);

    const updates: Record<string, unknown> = {
      title,
      description,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      category_id: categoryId || null,
      image_url: imageUrl || null,
      delivery_time: deliveryTime,
      stock: autoDelivery ? undefined : parseInt(stock) || 0,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    // If auto-delivery and new keys provided, add them
    if (autoDelivery && newStockKeys.trim()) {
      const keys = newStockKeys.split("\n").map((k) => k.trim()).filter(Boolean);
      const currentStock = parseInt(stock) || 0;
      updates.stock = currentStock + keys.length;
    }

    const { error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id as string)
      .eq("seller_id", user.id);

    if (error) {
      toast({ title: "Error saving product", description: error.message, variant: "destructive" });
    } else {
      // Insert new stock keys if provided
      if (autoDelivery && newStockKeys.trim()) {
        const keys = newStockKeys.split("\n").map((k) => k.trim()).filter(Boolean);
        const stockInserts = keys.map((key) => ({ product_id: id as string, key_code: key }));
        await supabase.from("product_stock").insert(stockInserts);
      }

      toast({ title: "Product updated!", description: "Your changes have been saved." });
      router.push("/seller/dashboard");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <SEO title="Edit Product — TradeVault" description="Edit your product listing" />
      <div className="container py-8 md:py-12">
        <Link href="/seller/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-2xl">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">Edit Product</h1>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-muted border-border" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="bg-muted border-border min-h-[120px]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-foreground">Price ($)</Label>
                <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="bg-muted border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice" className="text-foreground">Original Price ($)</Label>
                <Input id="originalPrice" type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="bg-muted border-border" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-foreground">Image URL</Label>
              <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="bg-muted border-border" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock" className="text-foreground">Stock</Label>
              <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required={!autoDelivery} disabled={autoDelivery} className="bg-muted border-border" />
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border border-border">
              <Checkbox id="autoDelivery" checked={autoDelivery} onCheckedChange={(checked) => setAutoDelivery(checked === true)} />
              <div>
                <Label htmlFor="autoDelivery" className="text-foreground font-medium cursor-pointer">Auto-Delivery</Label>
                <p className="text-xs text-muted-foreground">Keys delivered instantly after payment</p>
              </div>
            </div>

            {autoDelivery && (
              <div className="space-y-2">
                <Label htmlFor="newKeys" className="text-foreground">Add Stock Keys (optional)</Label>
                <Textarea id="newKeys" value={newStockKeys} onChange={(e) => setNewStockKeys(e.target.value)} placeholder="Paste additional keys, one per line..." className="bg-muted border-border min-h-[100px] font-mono text-sm" />
                <p className="text-xs text-muted-foreground">{newStockKeys.split("\n").filter((k) => k.trim()).length} keys will be added</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-foreground">Tags</Label>
              <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="game, key, steam, global" className="bg-muted border-border" />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving} className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/seller/dashboard")} className="border-border">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}