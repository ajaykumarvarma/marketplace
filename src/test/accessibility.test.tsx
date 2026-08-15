import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "vitest-axe";
import * as React from "react";

expect.extend(toHaveNoViolations);

// Mock next/router for page components
const mockUseRouter = () => ({
  pathname: "/",
  query: {},
  asPath: "/",
  push: () => Promise.resolve(true),
  replace: () => Promise.resolve(true),
  reload: () => {},
  back: () => {},
  prefetch: () => Promise.resolve(),
  beforePopState: () => {},
  events: { on: () => {}, off: () => {}, emit: () => {} },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
});

vi.mock("next/router", () => ({
  useRouter: mockUseRouter,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/head", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark", setTheme: () => {} }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
    }),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null, isLoading: false }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ items: [], totalItems: 0, totalPrice: 0 }),
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock lucide-react icons to avoid SVG rendering issues in tests
vi.mock("lucide-react", async () => {
  const actual = await vi.importActual("lucide-react");
  return {
    ...actual,
    Shield: () => <span data-testid="shield-icon" />,
    Search: () => <span data-testid="search-icon" />,
    ShoppingCart: () => <span data-testid="cart-icon" />,
    Menu: () => <span data-testid="menu-icon" />,
    X: () => <span data-testid="x-icon" />,
    ArrowRight: () => <span data-testid="arrow-right-icon" />,
    CheckCircle: () => <span data-testid="check-circle-icon" />,
    AlertTriangle: () => <span data-testid="alert-triangle-icon" />,
    Lock: () => <span data-testid="lock-icon" />,
    Eye: () => <span data-testid="eye-icon" />,
    EyeOff: () => <span data-testid="eye-off-icon" />,
    Mail: () => <span data-testid="mail-icon" />,
    Github: () => <span data-testid="github-icon" />,
    Moon: () => <span data-testid="moon-icon" />,
    Sun: () => <span data-testid="sun-icon" />,
    Store: () => <span data-testid="store-icon" />,
    TrendingUp: () => <span data-testid="trending-up-icon" />,
    Star: () => <span data-testid="star-icon" />,
    Award: () => <span data-testid="award-icon" />,
    Clock: () => <span data-testid="clock-icon" />,
    Package: () => <span data-testid="package-icon" />,
    Globe: () => <span data-testid="globe-icon" />,
    MessageSquare: () => <span data-testid="message-square-icon" />,
    SlidersHorizontal: () => <span data-testid="sliders-icon" />,
    Download: () => <span data-testid="download-icon" />,
    Trash2: () => <span data-testid="trash2-icon" />,
    Plus: () => <span data-testid="plus-icon" />,
    Minus: () => <span data-testid="minus-icon" />,
    Zap: () => <span data-testid="zap-icon" />,
    BookOpen: () => <span data-testid="book-open-icon" />,
    EyeIcon: () => <span data-testid="eye-icon" />,
    BarChart3: () => <span data-testid="barchart-icon" />,
    Ban: () => <span data-testid="ban-icon" />,
    ChevronRight: () => <span data-testid="chevron-right-icon" />,
    FileText: () => <span data-testid="file-text-icon" />,
    Scale: () => <span data-testid="scale-icon" />,
    Gavel: () => <span data-testid="gavel-icon" />,
    Server: () => <span data-testid="server-icon" />,
    Keyboard: () => <span data-testid="keyboard-icon" />,
  };
});

// Mock shadcn components to avoid complex renders
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, asChild, ...props }: any) => (
    asChild ? <>{children}</> : <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children }: any) => <>{children}</>,
  DialogContent: ({ children }: any) => <div role="dialog">{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <>{children}</>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  DropdownMenuSeparator: () => <hr />,
}));

import { HeroSection } from "@/components/landing/HeroSection";
import { TrustSignalsSection } from "@/components/landing/TrustSignalsSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";

describe("Accessibility - Landing Page Components", () => {
  it("HeroSection has no axe violations", async () => {
    const { container } = render(<HeroSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("TrustSignalsSection has no axe violations", async () => {
    const { container } = render(<TrustSignalsSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("CategoriesSection has no axe violations", async () => {
    const { container } = render(<CategoriesSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("HowItWorksSection has no axe violations", async () => {
    const { container } = render(<HowItWorksSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("CTASection has no axe violations", async () => {
    const { container } = render(<CTASection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Footer has no axe violations", async () => {
    const { container } = render(<Footer />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Navigation has no axe violations", async () => {
    const { container } = render(<Navigation />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Accessibility - Full Page Composites", () => {
  it("Landing page composition has no axe violations", async () => {
    const { container } = render(
      <div>
        <Navigation />
        <main>
          <HeroSection />
          <TrustSignalsSection />
          <CategoriesSection />
          <HowItWorksSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});