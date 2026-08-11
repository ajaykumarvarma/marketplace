import Link from "next/link";
import { useState } from "react";
import { Shield, Menu, X, ShoppingCart, User, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded bg-primary/10 border border-primary/20">
            <Shield className="h-[18px] w-[18px] text-primary" />
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            Trade<span className="text-primary">Vault</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/marketplace" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Marketplace
          </Link>
          <Link href="/categories" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Categories
          </Link>
          <Link href="/sellers" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Top Sellers
          </Link>
          <Link href="/sell" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Start Selling
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-medium text-accent-foreground flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <User className="h-4 w-4" />
              <span className="text-sm">Sign In</span>
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Store className="h-4 w-4" />
              <span>Get Started</span>
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 space-y-3">
            <Link href="/marketplace" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Marketplace
            </Link>
            <Link href="/categories" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Categories
            </Link>
            <Link href="/sellers" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Top Sellers
            </Link>
            <Link href="/sell" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Start Selling
            </Link>
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="w-full justify-start gap-2 bg-primary hover:bg-primary/90">
                  <Store className="h-4 w-4" />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}