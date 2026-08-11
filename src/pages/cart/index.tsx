import Link from "next/link";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Shield, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  if (totalItems === 0) {
    return (
      <>
        <SEO title="Cart — TradeVault" description="Your shopping cart on TradeVault." />
        <div className="container py-16 md:py-24 text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Browse our marketplace and add digital goods to your cart. All transactions are escrow-protected.
          </p>
          <Link href="/marketplace">
            <Button className="mt-4 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              Browse Marketplace
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Cart — TradeVault" description={`${totalItems} items in your cart. Secure checkout with escrow protection.`} />
      <div className="container py-8 md:py-12">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-lg p-4 flex gap-4">
                <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center shrink-0">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">Sold by {item.seller}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-foreground hover:bg-muted/80"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-mono text-sm w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-foreground hover:bg-muted/80"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-mono font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={clearCart} className="text-sm text-muted-foreground hover:text-destructive transition-colors">
              Clear cart
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4 sticky top-24">
              <h2 className="font-display font-semibold text-foreground">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span className="font-mono text-foreground">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Platform Fee (2%)</span>
                  <span className="font-mono text-foreground">${(totalPrice * 0.02).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Escrow Protection</span>
                  <span className="text-success text-xs">Included</span>
                </div>
                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="font-mono text-xl font-bold text-foreground">${(totalPrice * 1.02).toFixed(2)}</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-12">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3 text-success" />
                <span>256-bit SSL encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}