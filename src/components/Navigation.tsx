import Link from "next/link";
import { useState } from "react";
import { Shield, Menu, X, ShoppingCart, Store, LayoutDashboard, ChevronDown, LogOut, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, profile, signOut } = useAuth();
  const t = useTranslations("navigation");

  const userInitial = profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const isSeller = profile?.role === "seller" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded bg-primary/10 border border-primary/20">
            <Shield className="h-[18px] w-[18px] text-primary" />
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            Trade<span className="text-primary">Vault</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/marketplace" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            {t("marketplace")}
          </Link>
          <Link href="/categories" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            {t("categories")}
          </Link>
          <Link href="/sellers" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            {t("topSellers")}
          </Link>
          <Link href="/sell" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            {t("startSelling")}
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/cart" className="relative">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
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
            <KeyboardShortcutsHelp />
            <LocaleSwitcher />
            <ThemeSwitch />
          </div>

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
                    {t("myOrders")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/referrals" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Referrals
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/developer" className="flex items-center gap-2 cursor-pointer">
                    <Shield className="h-4 w-4" />
                    API & Webhooks
                  </Link>
                </DropdownMenuItem>
                {isSeller && (
                  <DropdownMenuItem asChild>
                    <Link href="/seller/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <Store className="h-4 w-4" />
                      {t("sellerDashboard")}
                    </Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="h-4 w-4" />
                      {t("adminPanel")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/notifications" className="flex items-center gap-2 cursor-pointer">
                    <Bell className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{t("signIn")}</span>
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Store className="h-4 w-4" />
                  <span>{t("getStarted")}</span>
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
          <div className="container py-4">
            <Link href="/marketplace" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-3">
              {t("marketplace")}
            </Link>
            <Link href="/categories" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-3">
              {t("categories")}
            </Link>
            <Link href="/sellers" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-3">
              {t("topSellers")}
            </Link>
            <Link href="/sell" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-3">
              {t("startSelling")}
            </Link>

            {user && (
              <>
                <Link href="/orders" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-3">
                  {t("myOrders")}
                </Link>
                {isSeller && (
                  <Link href="/seller/dashboard" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-3">
                    {t("sellerDashboard")}
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin/dashboard" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-3">
                    {t("adminPanel")}
                  </Link>
                )}
              </>
            )}

            <div className="pt-3 border-t border-border flex flex-col gap-2">
              {user ? (
                <Button variant="outline" className="w-full justify-start gap-2 text-destructive" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  {t("signOut")}
                </Button>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <User className="h-4 w-4" />
                      {t("signIn")}
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="w-full justify-start gap-2 bg-primary hover:bg-primary/90">
                      <Store className="h-4 w-4" />
                      {t("getStarted")}
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