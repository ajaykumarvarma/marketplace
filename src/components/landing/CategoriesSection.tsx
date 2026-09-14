import { useState, useEffect } from "react";
import Link from "next/link";
import { Gamepad2, Key, Palette, Code, Megaphone, GraduationCap, Crown, Wrench, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const categoryConfig = [
  { slug: "game-keys", icon: Gamepad2, label: "Game Keys", color: "from-rose-500 to-pink-600" },
  { slug: "accounts", icon: Key, label: "Accounts", color: "from-blue-500 to-cyan-500" },
  { slug: "design-assets", icon: Palette, label: "Design Assets", color: "from-violet-500 to-purple-500" },
  { slug: "software", icon: Code, label: "Software", color: "from-emerald-500 to-teal-500" },
  { slug: "marketing", icon: Megaphone, label: "Marketing", color: "from-amber-400 to-orange-500" },
  { slug: "courses", icon: GraduationCap, label: "Courses", color: "from-indigo-500 to-violet-500" },
  { slug: "premium", icon: Crown, label: "Premium", color: "from-yellow-400 to-amber-500" },
  { slug: "services", icon: Wrench, label: "Services", color: "from-sky-500 to-blue-500" },
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
      <div className="container px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Browse Categories
            </h2>
            <p className="text-muted-foreground">
              Find exactly what you need across our curated digital goods catalog.
            </p>
          </div>
          <Link href="/categories" className="hidden md:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryConfig.map((cat) => (
              <Link
                key={cat.label}
                href={`/marketplace?category=${cat.slug}`}
                className="p-5 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors group"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${cat.color} mb-3 shadow-md`}>
                  <cat.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">{cat.label}</h3>
                <p className="text-sm text-muted-foreground font-mono">{(counts[cat.slug] || 0).toLocaleString()} listings</p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 text-center md:hidden">
          <Link href="/categories" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            View All Categories →
          </Link>
        </div>
      </div>
    </section>
  );
}