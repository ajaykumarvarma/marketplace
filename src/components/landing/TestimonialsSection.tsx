import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  product_title: string;
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, product:product_id(title), reviewer:reviewer_id(full_name)")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(12);

      if (data) {
        const mapped = data.map((r: unknown) => {
          const row = r as Record<string, unknown>;
          return {
            id: String(row.id),
            reviewer_name: ((row.reviewer as Record<string, unknown>)?.full_name as string) || "Anonymous",
            rating: Number(row.rating),
            comment: String(row.comment),
            created_at: String(row.created_at),
            product_title: ((row.product as Record<string, unknown>)?.title as string) || "Product",
          };
        });
        setTestimonials(mapped);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <section className="border-t border-border py-16 md:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  const visible = testimonials.slice(currentIndex, currentIndex + 3);
  const canPrev = currentIndex > 0;
  const canNext = currentIndex + 3 < testimonials.length;

  return (
    <section className="border-t border-border py-16 md:py-20">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-muted-foreground text-xs font-medium mb-4">
              <Quote className="h-3 w-3" />
              Buyer Reviews
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Trusted by Thousands
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Real reviews from verified buyers who completed their purchases through our escrow system.
            </p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visible.map((t) => (
                <div
                  key={t.id}
                  className="bg-card border border-border rounded-lg p-6 flex flex-col"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < t.rating ? "fill-foreground text-foreground" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground mb-4 flex-1 leading-relaxed">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-medium text-foreground">{t.reviewer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Purchased {t.product_title} · {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {testimonials.length > 3 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 3))}
                  disabled={!canPrev}
                  className="h-9 w-9 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-40"
                  aria-label="Previous testimonials"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-muted-foreground font-mono">
                  {Math.floor(currentIndex / 3) + 1} / {Math.ceil(testimonials.length / 3)}
                </span>
                <button
                  onClick={() => setCurrentIndex((i) => Math.min(testimonials.length - 3, i + 3))}
                  disabled={!canNext}
                  className="h-9 w-9 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-40"
                  aria-label="Next testimonials"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}