import Link from "next/link";
import { useState } from "react";
import { Shield, Menu, X, ShoppingCart, Store, LayoutDashboard, ChevronDown, LogOut, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, profile, signOut } = useAuth();

  const userInitial = profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const isSeller = profile?.role === "seller" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded bg-primary/10 border border-primary/20">
            <Shield className="h-[18px] w-[18px] text-primary" />
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            Trade<span className="text-primary">Vault</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/marketplace" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Marketplace
          </Link>
          <Link href="/categories" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Categories
          </Link>
          <Link href="/sellers" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Top Sellers
          </Link>
          <Link href="/sell" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Start Selling
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/cart" className="relative">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                      {totalItems}
                    </Badge>
                  )}
                </Link>
                <NotificationBell />
              </>
            ) : (
              <Link href="/cart" className="relative">
                <ShoppingCart className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Link>
            )}
          </div>
          <ThemeSwitch />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-2 pr-3">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground max-w-[100px] truncate">
                    {profile?.full_name || user.email?.split("@")[0]}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                {isSeller && (
                  <DropdownMenuItem asChild>
                    <Link href="/seller/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <Store className="h-4 w-4" />
                      Seller Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
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
            </>
          )}
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

            {user && (
              <>
                <Link href="/orders" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  My Orders
                </Link>
                {isSeller && (
                  <Link href="/seller/dashboard" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Seller Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin/dashboard" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Admin Panel
                  </Link>
                )}
              </>
            )}

            <div className="pt-3 border-t border-border flex flex-col gap-2">
              {user ? (
                <Button variant="outline" className="w-full justify-start gap-2 text-destructive" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}