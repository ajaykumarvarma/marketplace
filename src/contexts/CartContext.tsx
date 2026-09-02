import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CartItem {
  id: string;
  title: string;
  price: number;
  seller: string;
  sellerId: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface SupabaseCartRow {
  product_id: string;
  quantity: number;
  products?: {
    title?: string;
    price?: number;
    seller_id?: string;
    seller?: { full_name?: string } | null;
  } | null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadSupabaseCart = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity, products:product_id(title, price, seller:seller_id(full_name))")
      .eq("user_id", user.id);

    if (error || !data) return;

    const cartItems: CartItem[] = (data as unknown as SupabaseCartRow[]).map((row) => ({
      id: row.product_id,
      title: row.products?.title || "Unknown",
      price: row.products?.price || 0,
      seller: row.products?.seller?.full_name || "Unknown",
      sellerId: row.products?.seller_id || "",
      quantity: row.quantity,
    }));

    setItems(cartItems);
  }, [user]);

  const syncSupabaseCart = useCallback(async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);

    if (items.length === 0) return;

    const rows = items.map((item) => ({
      user_id: user.id,
      product_id: item.id,
      quantity: item.quantity,
    }));

    await supabase.from("cart_items").insert(rows);
  }, [user, items]);

  // Load cart: from Supabase if logged in, else localStorage
  useEffect(() => {
    setMounted(true);
    if (user) {
      loadSupabaseCart();
    } else {
      try {
        const saved = localStorage.getItem("tradevault-cart");
        if (saved) setItems(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, [user, loadSupabaseCart]);

  // Save cart: to Supabase if logged in, else localStorage
  useEffect(() => {
    if (!mounted) return;
    if (user) {
      syncSupabaseCart();
    } else {
      localStorage.setItem("tradevault-cart", JSON.stringify(items));
    }
  }, [items, mounted, user, syncSupabaseCart]);

  const addItem = async (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        toast({ title: "Cart updated", description: `Increased quantity of ${item.title}` });
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      toast({ title: "Added to cart", description: item.title });
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) toast({ title: "Removed from cart", description: item.title });
      return prev.filter((i) => i.id !== id);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => {
    setItems([]);
    toast({ title: "Cart cleared" });
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}