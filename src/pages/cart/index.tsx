import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Shield, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <SEO title="Shopping Cart — TradeVault" description="Review your items and proceed to checkout." />
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>
            <div>
              <div className="h-24 bg-muted rounded-lg mb-4" />
              <div className="h-24 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Shopping Cart — TradeVault" description="Review your items and proceed to checkout with escrow protection." />
      <div className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-medium text-foreground mb-2">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mb-4">Browse the marketplace to find digital goods</p>
              <Link href="/marketplace">
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Browse Marketplace
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {items.map((item) => (
                  <div key={item.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.seller}</p>
                      <p className="font-mono text-sm text-foreground mt-1">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-9 w-9 sm:h-8 sm:w-8 flex items-center justify-center rounded-md border border-border hover:bg-muted"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-mono text-sm w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-9 w-9 sm:h-8 sm:w-8 flex items-center justify-center rounded-md border border-border hover:bg-muted"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <div className="bg-card border border-border rounded-lg p-4 md:p-6 sm:sticky sm:top-24">
                  <h3 className="font-display font-semibold text-foreground mb-4">Order Summary</h3>
                  <div className="text-sm mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Items ({totalItems})</span>
                      <span className="font-mono text-foreground">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Protection Fee</span>
                      <span className="font-mono text-success">Free</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Escrow</span>
                      <span className="text-success flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Included
                      </span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="font-mono text-xl font-bold text-foreground">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <Link href="/checkout">
                    <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-12">
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-3">
                    <Shield className="h-3 w-3 text-success" />
                    <span>Escrow protected checkout</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}