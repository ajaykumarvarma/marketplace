import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Image from "next/image";

interface Suggestion {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  category: { name: string } | null;
}

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export function SearchAutocomplete({ value, onChange, onSearch, placeholder = "Search products..." }: SearchAutocompleteProps) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("id, title, price, image_url, category:category_id(name)")
      .ilike("title", `%${query}%`)
      .eq("status", "active")
      .order("featured", { ascending: false })
      .limit(6);

    if (data) {
      setSuggestions(data as unknown as Suggestion[]);
      setOpen(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        router.push(`/marketplace/${suggestions[highlightedIndex].id}`);
        setOpen(false);
      } else {
        onSearch();
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function selectSuggestion(suggestion: Suggestion) {
    router.push(`/marketplace/${suggestion.id}`);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setHighlightedIndex(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
        {!loading && value && (
          <button
            onClick={onSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
          {suggestions.map((suggestion, i) => (
            <button
              key={suggestion.id}
              onClick={() => selectSuggestion(suggestion)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors ${i === highlightedIndex ? "bg-muted" : ""}`}
            >
              <div className="h-10 w-10 bg-muted rounded overflow-hidden shrink-0 relative">
                <Image
                  src={suggestion.image_url || "/generated/hero-product.png"}
                  alt={suggestion.title}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{suggestion.title}</p>
                <p className="text-xs text-muted-foreground">
                  {suggestion.category?.name || "Other"} · ${suggestion.price.toFixed(2)}
                </p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </button>
          ))}
          <div className="px-3 py-2 border-t border-border bg-muted/50">
            <button
              onClick={() => { onSearch(); setOpen(false); }}
              className="text-xs text-muted-foreground hover:text-foreground w-full text-left"
            >
              Press Enter to search all results for &ldquo;{value}&rdquo;
            </button>
          </div>
        </div>
      )}

      {open && !loading && value.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">No products found for &ldquo;{value}&rdquo;</p>
          <button
            onClick={() => { onSearch(); setOpen(false); }}
            className="text-xs text-primary hover:underline mt-1"
          >
            Search all results
          </button>
        </div>
      )}
    </div>
  );
}