import { useState, useCallback } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilterState {
  query: string;
  category: string;
  minPrice: number | "";
  maxPrice: number | "";
  rating: number;
  sortBy: "relevance" | "price_asc" | "price_desc" | "rating" | "newest";
}

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
  categories?: { id: string; name: string }[];
}

export function SearchFilters({ onFilterChange, initialFilters, categories = [] }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    query: initialFilters?.query ?? "",
    category: initialFilters?.category ?? "",
    minPrice: initialFilters?.minPrice ?? "",
    maxPrice: initialFilters?.maxPrice ?? "",
    rating: initialFilters?.rating ?? 0,
    sortBy: initialFilters?.sortBy ?? "relevance",
  });
  const [expanded, setExpanded] = useState(false);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      onFilterChange(next);
      return next;
    });
  }, [onFilterChange]);

  const clearFilters = () => {
    const cleared: FilterState = { query: "", category: "", minPrice: "", maxPrice: "", rating: 0, sortBy: "relevance" };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const activeCount = [filters.category, filters.minPrice !== "" ? "price" : "", filters.rating > 0 ? "rating" : ""].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            className="pl-10 bg-muted border-border"
          />
        </div>
        <Button variant="outline" onClick={() => setExpanded(!expanded)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">{activeCount}</Badge>}
        </Button>
        {activeCount > 0 && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 border border-border rounded-lg bg-card">
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-1 block">Category</label>
            <select
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-muted border border-border text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-1 block">Min Price</label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => updateFilter("minPrice", e.target.value === "" ? "" : Number(e.target.value))}
              className="bg-muted border-border"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-1 block">Max Price</label>
            <Input
              type="number"
              placeholder="9999"
              value={filters.maxPrice}
              onChange={(e) => updateFilter("maxPrice", e.target.value === "" ? "" : Number(e.target.value))}
              className="bg-muted border-border"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-1 block">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter("sortBy", e.target.value as FilterState["sortBy"])}
              className="w-full h-9 px-3 rounded-md bg-muted border border-border text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}