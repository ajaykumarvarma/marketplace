import { useState, useEffect } from "react";
import Link from "next/link";
import { Gamepad2, Key, Palette, Code, Megaphone, GraduationCap, Crown, Wrench, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const categoryConfig = [
  { slug: "game-keys", icon: Gamepad2, label: "Game Keys", color: "text-accent" },
  { slug: "accounts", icon: Key, label: "Accounts", color: "text-primary" },
  { slug: "design-assets", icon: Palette, label: "Design Assets", color: "text-warning" },
  { slug: "software", icon: Code, label: "Software", color: "text-success" },
  { slug: "marketing", icon: Megaphone, label: "Marketing", color: "text-destructive" },
  { slug: "courses", icon: GraduationCap, label: "Courses", color: "text-primary" },
  { slug: "premium", icon: Crown, label: "Premium", color: "text-accent" },
  { slug: "services", icon: Wrench, label: "Services", color: "text-warning" },
];

export function CategoriesSection() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounts();
  }, []);

  async function fetchCounts() {
    const { data } = await supabase.from("products").select("category, id");
    if (data) {
      const map: Record<string, number> = {};
      data.forEach((p) => {
        const cat = (p.category || "other").toLowerCase().replace(/\s+/g, "-");
        map[cat] = (map[cat] || 0) + 1;
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
          <Link href="/categories" className="hidden md:inline-flex text-sm font-medium text-primary hover:text-primary/80 transition-colors">
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
                className="group p-5 bg-card border border-border rounded-lg hover:border-primary/30 hover:bg-muted/30 transition-all duration-300"
              >
                <cat.icon className={`h-6 w-6 ${cat.color} mb-3`} />
                <h3 className="font-display font-semibold text-foreground mb-1">{cat.label}</h3>
                <p className="text-xs text-muted-foreground font-mono">{(counts[cat.slug] || 0).toLocaleString()} listings</p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 text-center md:hidden">
          <Link href="/categories" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            View All Categories →
          </Link>
        </div>
      </div>
    </section>
  );
}