import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Upload, Tag, DollarSign, Package, FileText, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

const categories = [
  "Game Keys",
  "Accounts",
  "Software",
  "Digital Art",
  "Services",
  "Gift Cards",
  "Subscriptions",
];

export default function NewProductPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for form submission
  };

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
            {/* Product Images */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                Product Images
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg relative overflow-hidden">
                    <Image
                      src={img}
                      alt={`Product image ${i + 1}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute top-2 right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs z-10"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
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

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Basic Information
              </h3>
              <div className="space-y-2">
                <Label htmlFor="title">Product Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Steam Game Keys Bundle — 50+ Titles"
                  className="bg-muted border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what buyers will receive, delivery method, and any guarantees..."
                  className="bg-muted border-border min-h-[120px]"
                  required
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Pricing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="19.99"
                    className="bg-muted border-border font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="99.99"
                    className="bg-muted border-border font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Category & Stock */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Category & Inventory
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full px-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="1"
                    placeholder="50"
                    className="bg-muted border-border font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Delivery
              </h3>
              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Estimated Delivery Time</Label>
                <Input
                  id="deliveryTime"
                  placeholder="e.g., Instant, 5 minutes, 1 hour"
                  className="bg-muted border-border"
                  required
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Tags
              </h3>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add a tag and press Enter"
                  className="bg-muted border-border"
                />
                <Button type="button" variant="outline" onClick={addTag} className="border-border hover:bg-muted">
                  Add
                </Button>
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
              <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Upload className="h-4 w-4" />
                Publish Listing
              </Button>
              <Button type="button" variant="outline" className="border-border hover:bg-muted">
                Save as Draft
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}