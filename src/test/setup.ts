import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// Mock Supabase environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock-project.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "mock-publishable-key";

// Mock next/router
vi.mock("next/router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    query: {},
    pathname: "/",
    asPath: "/",
  })),
}));

// Mock next/link to render as simple anchor
vi.mock("next/link", () => ({
  default: function MockLink({ children, href, ...props }: any) {
    return React.createElement("a", { href, ...props }, children);
  },
}));

// Mock Supabase client module
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })) })) })),
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })) })) })),
      delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
    })),
  },
}));

// Mock AuthContext
let signInCallCount = 0;
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "test-user-id", email: "test@example.com" },
    profile: { id: "test-user-id", full_name: "Test User", role: "buyer" },
    isLoading: false,
    signIn: vi.fn(() => {
      signInCallCount++;
      if (signInCallCount < 5) {
        return Promise.resolve({ error: { message: "Invalid credentials" } });
      }
      return Promise.resolve({ error: { message: "Account temporarily locked. Please try again in 30 minutes." } });
    }),
    signUp: vi.fn(() => Promise.resolve({ error: null })),
    signOut: vi.fn(() => Promise.resolve()),
    isAdmin: false,
    isSeller: false,
  })),
  AuthProvider: function MockAuthProvider({ children }: any) {
    return React.createElement(React.Fragment, null, children);
  },
}));

// Mock toast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));