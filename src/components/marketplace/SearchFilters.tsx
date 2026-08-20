import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchFiltersProps {
  categories: { id: string; name: string }[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "featured" | "price_low" | "price_high" | "newest";
  onSortChange: (sort: string) => void;
  onPriceChange: (range: [number, number]) => void;
  resultCount: number;
}

export function SearchFilters({
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onPriceChange,
  resultCount,
}: SearchFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const applyPrice = () => {
    onPriceChange([Number(minPrice) || 0, Number(maxPrice) || 10000]);
  };

  const activeCount = [activeCategory !== "All" ? "cat" : "", minPrice || maxPrice ? "price" : ""].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-muted border-border"
          />
        </div>
        <Button variant="outline" onClick={() => setExpanded(!expanded)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">{activeCount}</Badge>}
        </Button>
        {activeCount > 0 && (
          <Button variant="ghost" size="icon" onClick={() => { onCategoryChange("All"); setMinPrice(""); setMaxPrice(""); onPriceChange([0, 10000]); }}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 border border-border rounded-lg bg-card">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
            <select
              value={activeCategory === "All" ? "" : activeCategory}
              onChange={(e) => onCategoryChange(e.target.value || "All")}
              className="w-full h-9 px-3 rounded-md bg-muted border border-border text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Min Price</label>
            <Input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-muted border-border"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Price</label>
            <Input
              type="number"
              placeholder="9999"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-muted border-border"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-muted border border-border text-sm"
            >
              <option value="featured">Featured</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{resultCount} results</span>
            <Button size="sm" variant="outline" onClick={applyPrice}>Apply Price Filter</Button>
          </div>
        </div>
      )}
    </div>
  );
}