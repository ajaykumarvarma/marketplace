import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { getDeviceFingerprint } from "@/services/fraudService";

interface Profile {
  id: string;
  full_name: string | null;
  role: "buyer" | "seller" | "admin";
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  emailConfirmed: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>;
  signUp: (email: string, password: string, role: "buyer" | "seller") => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setEmailConfirmed(session?.user?.email_confirmed_at ? true : false);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setEmailConfirmed(session?.user?.email_confirmed_at ? true : false);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    // Session refresh interval (refresh 5 min before expiry)
    const refreshInterval = setInterval(() => {
      if (session && session.expires_at) {
        const expiresAt = session.expires_at * 1000;
        const fiveMinBefore = expiresAt - 5 * 60 * 1000;
        if (Date.now() >= fiveMinBefore) {
          supabase.auth.refreshSession();
        }
      }
    }, 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [session?.expires_at]);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
    setIsLoading(false);
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (data?.user && !data.user.email_confirmed_at) {
      return { error: null, needsEmailConfirmation: true };
    }

    // Log device fingerprint for security audit
    try {
      const fp = await getDeviceFingerprint();
      await supabase.from("fraud_logs").insert({
        event_type: "auth_login",
        user_id: data?.user?.id,
        metadata: { device_fingerprint: fp, email },
      });
    } catch {
      // Non-blocking
    }

    return { error };
  }

  async function signUp(email: string, password: string, role: "buyer" | "seller") {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: email.split("@")[0] },
        emailRedirectTo: `${window.location.origin}/auth/confirm-email`,
      },
    });
    return { error };
  }

  async function resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setEmailConfirmed(false);
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  }

  async function refreshProfile() {
    if (user) {
      await fetchProfile(user.id);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAdmin: profile?.role === "admin",
        isSeller: profile?.role === "seller" || profile?.role === "admin",
        emailConfirmed,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshProfile,
        resendConfirmation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}