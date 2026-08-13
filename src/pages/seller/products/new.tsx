import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Upload, Tag, DollarSign, Package, FileText, Layers, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "",
    deliveryTime: "",
    deliveryContent: "",
    category: "",
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast({ title: "Authentication required", description: "Please sign in to list products.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("products").insert({
      seller_id: user.id,
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      category: formData.category,
      stock: parseInt(formData.stock),
      delivery_time: formData.deliveryTime,
      delivery_content: formData.deliveryContent || null,
      tags: tags.length > 0 ? (tags as any) : null,
      images: images.length > 0 ? (images as any) : null,
    } as any);

    setLoading(false);
    if (error) {
      toast({ title: "Error creating listing", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product listed!", description: "Your product is now live on the marketplace." });
      router.push("/seller/dashboard");
    }
  }

  return (
    <>
      <SEO title="List New Product — TradeVault" description="Create a new digital product listing on TradeVault." />
      <div className="container py-8 md:py-12">
        <Link href="/seller/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-3xl">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">List New Product</h1>
            <p className="text-muted-foreground">Create a new digital product listing for buyers</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                Product Images
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg relative overflow-hidden">
                    <Image src={img} alt={`Product image ${i + 1}`} fill sizes="25vw" className="object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute top-2 right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs z-10"
                      aria-label="Remove image"
                    >×</button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setImages([...images, `/generated/hero-product.png`])}
                  className="aspect-square bg-muted border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors"
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Image</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Basic Information
              </h3>
              <div className="space-y-2">
                <Label htmlFor="title">Product Title</Label>
                <Input id="title" required value={formData.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="e.g., Steam Game Keys Bundle — 50+ Titles" className="bg-muted border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" required value={formData.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Describe what buyers will receive, delivery method, and any guarantees..." className="bg-muted border-border min-h-[120px]" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Pricing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input id="price" type="number" step="0.01" min="0.01" required value={formData.price} onChange={(e) => handleChange("price", e.target.value)} placeholder="19.99" className="bg-muted border-border font-mono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                  <Input id="originalPrice" type="number" step="0.01" min="0" value={formData.originalPrice} onChange={(e) => handleChange("originalPrice", e.target.value)} placeholder="99.99" className="bg-muted border-border font-mono" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Category & Inventory
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select id="category" required value={formData.category} onChange={(e) => handleChange("category", e.target.value)} className="w-full px-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Select a category</option>
                    <option value="Game Keys">Game Keys</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Software">Software</option>
                    <option value="Digital Art">Digital Art</option>
                    <option value="Services">Services</option>
                    <option value="Gift Cards">Gift Cards</option>
                    <option value="Subscriptions">Subscriptions</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input id="stock" type="number" min="1" required value={formData.stock} onChange={(e) => handleChange("stock", e.target.value)} placeholder="50" className="bg-muted border-border font-mono" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Delivery & Auto-Delivery
              </h3>
              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Estimated Delivery Time</Label>
                <Input id="deliveryTime" required value={formData.deliveryTime} onChange={(e) => handleChange("deliveryTime", e.target.value)} placeholder="e.g., Instant, 5 minutes, 1 hour" className="bg-muted border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryContent">Auto-Delivery Content (Optional)</Label>
                <Textarea
                  id="deliveryContent"
                  value={formData.deliveryContent || ""}
                  onChange={(e) => handleChange("deliveryContent", e.target.value)}
                  placeholder="Enter digital content that will be automatically delivered to buyers (license keys, download links, account credentials, etc.)..."
                  className="bg-muted border-border min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">This content will be shown to buyers immediately after purchase confirmation.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Tags
              </h3>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add a tag and press Enter" className="bg-muted border-border" />
                <Button type="button" variant="outline" onClick={addTag} className="border-border hover:bg-muted">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 bg-muted text-muted-foreground">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-foreground">×</button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
              <Button type="submit" disabled={loading} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {loading ? "Publishing..." : "Publish Listing"}
              </Button>
              <Button type="button" variant="outline" className="border-border hover:bg-muted">Save as Draft</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}