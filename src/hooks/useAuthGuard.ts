import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";

export function useAuthGuard(requireSeller = false, requireAdmin = false) {
  const { user, isLoading, isSeller, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/auth/login?redirect=" + encodeURIComponent(router.asPath));
      return;
    }

    if (requireAdmin && !isAdmin) {
      router.push("/");
      return;
    }

    if (requireSeller && !isSeller) {
      router.push("/");
      return;
    }
  }, [user, isLoading, isSeller, isAdmin, router, requireSeller, requireAdmin]);
}