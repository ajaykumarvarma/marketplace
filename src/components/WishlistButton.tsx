import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function WishlistButton({ productId }: { productId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkWishlist();
  }, [user, productId]);

  async function checkWishlist() {
    const { data } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user!.id)
      .eq("product_id", productId)
      .maybeSingle();

    setIsWishlisted(!!data);
  }

  async function toggleWishlist() {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save items to your wishlist.", variant: "destructive" });
      return;
    }

    setLoading(true);
    if (isWishlisted) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
      setIsWishlisted(false);
      toast({ title: "Removed from wishlist" });
    } else {
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
      setIsWishlisted(true);
      toast({ title: "Added to wishlist" });
    }
    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={toggleWishlist}
      className={`gap-2 border-border hover:bg-muted ${isWishlisted ? "text-destructive border-destructive/30" : "text-muted-foreground"}`}
    >
      <Heart className={`h-4 w-4 ${isWishlisted ? "fill-destructive" : ""}`} />
      {isWishlisted ? "Saved" : "Save"}
    </Button>
  );
}