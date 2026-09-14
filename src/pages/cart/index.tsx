import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Shield, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingItem(itemId);
    updateQuantity(itemId, newQuantity);
    // Small delay to show loading state
    setTimeout(() => setUpdatingItem(null), 200);
  };

  const handleRemoveItem = async (itemId: string, itemTitle: string) => {
    setRemovingItem(itemId);
    setTimeout(() => {
      removeItem(itemId);
      setRemovingItem(null);
      toast({ title: "Item removed", description: `${itemTitle} removed from your cart.` });
    }, 200);
  };

  if (!mounted) {
    return (
      <>
        <SEO title="Shopping Cart — TradeVault" description="Review your items and proceed to checkout." />
        <div className="container px-4 sm:px-6 py-12">
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
      <div className="container px-4 sm:px-6 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-xl">
              <ShoppingCart className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-display text-lg font-medium text-foreground mb-2">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mb-6">Browse the drop to find keys, licences and subscriptions</p>
              <Link href="/marketplace">
                <Button className="h-11 gap-2 bg-gradient-to-r from-primary to-blue-500 text-white hover:opacity-90 text-sm font-medium rounded-lg shadow-lg shadow-primary/25">
                  Browse Marketplace
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className={`bg-card border border-border rounded-xl p-4 flex items-center gap-4 ${removingItem === item.id ? "opacity-50" : ""}`}>
                    <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-md">
                      <span className="text-lg font-bold text-white font-mono">
                        {item.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-[15px] truncate">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.seller}</p>
                      <p className="font-mono text-sm text-primary font-semibold mt-0.5">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={updatingItem === item.id || item.quantity <= 1}
                        className="h-8 w-8 flex items-center justify-center rounded-md border border-border disabled:opacity-50 hover:border-primary hover:text-primary transition-colors"
                        aria-label="Decrease quantity"
                      >
                        {updatingItem === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Minus className="h-3 w-3" />}
                      </button>
                      <span className="font-mono text-sm w-7 text-center text-foreground font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={updatingItem === item.id}
                        className="h-8 w-8 flex items-center justify-center rounded-md border border-border disabled:opacity-50 hover:border-primary hover:text-primary transition-colors"
                        aria-label="Increase quantity"
                      >
                        {updatingItem === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id, item.title)}
                      disabled={removingItem === item.id}
                      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-400 disabled:opacity-50 transition-colors"
                      aria-label="Remove item"
                    >
                      {removingItem === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <div className="bg-card border border-border rounded-xl p-5 sm:sticky sm:top-24">
                  <h3 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Order Summary</h3>
                  <div className="text-sm mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Items ({totalItems})</span>
                      <span className="font-mono text-foreground">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Protection Fee</span>
                      <span className="font-mono text-emerald-400 font-medium">Free</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="font-mono text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <Link href="/checkout">
                    <Button className="w-full gap-2 bg-gradient-to-r from-primary to-blue-500 text-white hover:opacity-90 text-sm font-medium h-11 rounded-lg shadow-lg shadow-primary/25 border-0">
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-3">
                    <Shield className="h-3 w-3 text-primary" />
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