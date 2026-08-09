import Link from "next/link";
import { Gamepad2, Key, Palette, Code, Megaphone, GraduationCap, Crown, Wrench, Music, Globe } from "lucide-react";

const categories = [
  { icon: Gamepad2, label: "Game Keys", count: 1247, color: "text-accent" },
  { icon: Key, label: "Accounts", count: 892, color: "text-primary" },
  { icon: Palette, label: "Design Assets", count: 634, color: "text-warning" },
  { icon: Code, label: "Software", count: 521, color: "text-success" },
  { icon: Megaphone, label: "Marketing", count: 378, color: "text-destructive" },
  { icon: GraduationCap, label: "Courses", count: 445, color: "text-primary" },
  { icon: Crown, label: "Premium", count: 203, color: "text-accent" },
  { icon: Wrench, label: "Services", count: 567, color: "text-warning" },
];

export function CategoriesSection() {
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={`/marketplace?category=${cat.label.toLowerCase().replace(" ", "-")}`}
              className="group p-5 bg-card border border-border rounded-lg hover:border-primary/30 hover:bg-muted/30 transition-all duration-300"
            >
              <cat.icon className={`h-6 w-6 ${cat.color} mb-3`} />
              <h3 className="font-display font-semibold text-foreground mb-1">{cat.label}</h3>
              <p className="text-xs text-muted-foreground font-mono">{cat.count.toLocaleString()} listings</p>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link href="/categories" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            View All Categories →
          </Link>
        </div>
      </div>
    </section>
  );
}