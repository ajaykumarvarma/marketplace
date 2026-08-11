import Link from "next/link";
import { Gamepad2, Key, Palette, Code, Megaphone, GraduationCap, CreditCard, Music, Film, BookOpen, TrendingUp, ArrowRight, Shield, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

const categories = [
  {
    id: "game-keys",
    name: "Game Keys",
    description: "Steam, Epic, Xbox, PlayStation keys at unbeatable prices",
    icon: Gamepad2,
    listings: 1247,
    topSeller: "GameVault",
    rating: 4.9,
    featured: ["Steam Bundles", "AAA Titles", "Indie Gems"],
  },
  {
    id: "accounts",
    name: "Accounts",
    description: "Fully verified gaming and streaming accounts",
    icon: Key,
    listings: 892,
    topSeller: "EpicTrades",
    rating: 4.7,
    featured: ["Fortnite", "Valorant", "Netflix"],
  },
  {
    id: "software",
    name: "Software",
    description: "Licensed software and creative tools",
    icon: Code,
    listings: 634,
    topSeller: "LicenseHub",
    rating: 4.8,
    featured: ["Adobe CC", "Microsoft 365", "VPNs"],
  },
  {
    id: "digital-art",
    name: "Digital Art",
    description: "NFTs, 3D assets, design templates",
    icon: Palette,
    listings: 421,
    topSeller: "ArtForge",
    rating: 4.6,
    featured: ["3D Models", "Textures", "Templates"],
  },
  {
    id: "services",
    name: "Services",
    description: "Boosting, coaching, custom work",
    icon: Megaphone,
    listings: 756,
    topSeller: "ProBoost",
    rating: 4.8,
    featured: ["Game Boosting", "Coaching", "Design"],
  },
  {
    id: "gift-cards",
    name: "Gift Cards",
    description: "Digital gift cards for every platform",
    icon: CreditCard,
    listings: 1089,
    topSeller: "GiftGenie",
    rating: 4.9,
    featured: ["Amazon", "Google Play", "iTunes"],
  },
  {
    id: "subscriptions",
    name: "Subscriptions",
    description: "Streaming and SaaS at fraction of retail",
    icon: Music,
    listings: 523,
    topSeller: "SubMaster",
    rating: 4.8,
    featured: ["Spotify", "Netflix", "Disney+"],
  },
  {
    id: "courses",
    name: "Courses",
    description: "Premium e-learning and tutorials",
    icon: GraduationCap,
    listings: 312,
    topSeller: "EduVault",
    rating: 4.7,
    featured: ["Programming", "Design", "Marketing"],
  },
  {
    id: "movies",
    name: "Movies & TV",
    description: "Digital movie codes and series access",
    icon: Film,
    listings: 267,
    topSeller: "StreamKing",
    rating: 4.5,
    featured: ["4K Movies", "Series Packs", "Early Access"],
  },
  {
    id: "ebooks",
    name: "E-Books",
    description: "Digital books, comics, and magazines",
    icon: BookOpen,
    listings: 189,
    topSeller: "BookHaven",
    rating: 4.6,
    featured: ["Fiction", "Tech", "Comics"],
  },
];

export default function CategoriesPage() {
  return (
    <>
      <SEO title="Browse Categories — TradeVault" description="Explore all digital goods categories on TradeVault. Game keys, accounts, software, subscriptions, and more." />
      <div className="container py-8 md:py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Browse digital goods by category — 6,130+ active listings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/marketplace?category=${cat.id}`}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 hover:-translate-y-0.5 transition-all group space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <cat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{cat.listings.toLocaleString()} listings</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <p className="text-sm text-muted-foreground">{cat.description}</p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3 text-success" />
                <span>Top seller: {cat.topSeller}</span>
                <span>·</span>
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  <span>{cat.rating}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {cat.featured.map((f) => (
                  <Badge key={f} variant="outline" className="border-border text-[10px] text-muted-foreground">
                    {f}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
          <TrendingUp className="h-8 w-8 text-primary mx-auto" />
          <h3 className="font-display font-semibold text-foreground">Can't find what you're looking for?</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Our marketplace grows daily. Request a category or browse the full marketplace for uncategorized listings.
          </p>
          <Link href="/marketplace">
            <span className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              Browse All Listings <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}