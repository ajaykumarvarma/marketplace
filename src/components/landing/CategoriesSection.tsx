import { useState, useEffect } from "react";
import Link from "next/link";
import { Gamepad2, Key, Palette, Code, Megaphone, GraduationCap, Crown, Wrench, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const categoryConfig = [
  { slug: "game-keys", icon: Gamepad2, label: "Game Keys" },
  { slug: "accounts", icon: Key, label: "Accounts" },
  { slug: "design-assets", icon: Palette, label: "Design Assets" },
  { slug: "software", icon: Code, label: "Software" },
  { slug: "marketing", icon: Megaphone, label: "Marketing" },
  { slug: "courses", icon: GraduationCap, label: "Courses" },
  { slug: "premium", icon: Crown, label: "Premium" },
  { slug: "services", icon: Wrench, label: "Services" },
];

export function CategoriesSection() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounts();
  }, []);

  async function fetchCounts() {
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from("products").select("category_id, id"),
      supabase.from("categories").select("id, slug"),
    ]);

    if (productsRes.data && categoriesRes.data) {
      const slugMap: Record<string, string> = {};
      categoriesRes.data.forEach((c) => {
        if (c.id && c.slug) slugMap[c.id] = c.slug;
      });

      const map: Record<string, number> = {};
      productsRes.data.forEach((p) => {
        const catId = p.category_id;
        if (!catId) return;
        const slug = slugMap[catId] || "other";
        map[slug] = (map[slug] || 0) + 1;
      });
      setCounts(map);
    }
    setLoading(false);
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Browse Categories
            </h2>
            <p className="text-muted-foreground">
              Find exactly what you need across our curated digital goods catalog.
            </p>
          </div>
          <Link href="/categories" className="hidden md:inline-flex text-sm font-medium text-primary hover:text-primary/80">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryConfig.map((cat) => (
              <Link
                key={cat.label}
                href={`/marketplace?category=${cat.slug}`}
                className="p-5 bg-card border border-border rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted border border-border mb-3 group-hover:bg-muted">
                  <cat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">{cat.label}</h3>
                <p className="text-sm text-muted-foreground font-mono">{(counts[cat.slug] || 0).toLocaleString()} listings</p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 text-center md:hidden">
          <Link href="/categories" className="text-sm font-medium text-primary hover:text-primary/80">
            View All Categories →
          </Link>
        </div>
      </div>
    </section>
  );
}