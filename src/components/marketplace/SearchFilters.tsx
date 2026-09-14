import { useState } from "react";
import { SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SearchAutocomplete } from "./SearchAutocomplete";

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

  const handleSearch = () => {
    onSearchChange(searchQuery);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <SearchAutocomplete
          value={searchQuery}
          onChange={onSearchChange}
          onSearch={handleSearch}
          placeholder="Search products..."
        />
        <Button variant="outline" onClick={() => setExpanded(!expanded)} className="gap-2 shrink-0 h-10">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 && <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">{activeCount}</Badge>}
        </Button>
      </div>

      {/* Horizontal pill category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onCategoryChange(c.id === "all" ? "All" : c.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              (c.id === "all" && activeCategory === "All") || activeCategory === c.id
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 border border-border rounded-lg bg-card">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Min Price</label>
            <Input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-muted border-border h-9"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Price</label>
            <Input
              type="number"
              placeholder="9999"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-muted border-border h-9"
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
          <div className="flex items-end">
            <Button size="sm" variant="outline" onClick={applyPrice} className="w-full h-9 border-border">
              Apply Price Filter
            </Button>
          </div>
          {activeCount > 0 && (
            <div className="sm:col-span-2 lg:col-span-4 flex justify-between items-center pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">{resultCount} results</span>
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-8" onClick={() => { onCategoryChange("All"); setMinPrice(""); setMaxPrice(""); onPriceChange([0, 10000]); }}>
                <X className="h-3 w-3" />
                Clear all
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}