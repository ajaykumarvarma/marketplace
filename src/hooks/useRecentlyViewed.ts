import { useState, useEffect, useCallback } from "react";

interface RecentProduct {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  category: string | null;
  viewedAt: string;
}

const STORAGE_KEY = "tradevault_recently_viewed";

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentProduct[];
        // Remove items older than 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const filtered = parsed.filter((p) => new Date(p.viewedAt).getTime() > thirtyDaysAgo);
        setRecentlyViewed(filtered);
      }
    } catch {
      setRecentlyViewed([]);
    }
  }, []);

  const addToRecentlyViewed = useCallback((product: Omit<RecentProduct, "viewedAt">) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const updated = [{ ...product, viewedAt: new Date().toISOString() }, ...filtered].slice(0, 12);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentlyViewed([]);
  }, []);

  return { recentlyViewed, addToRecentlyViewed, clearRecentlyViewed };
}