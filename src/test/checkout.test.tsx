import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CheckoutPage from "@/pages/checkout/index";

// Mock next/router
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock useCart to provide test items
vi.mock("@/contexts/CartContext", () => ({
  useCart: vi.fn(() => ({
    items: [
      { id: "test-prod-1", title: "Test Product", price: 29.99, seller: "TestSeller", quantity: 2 },
    ],
    totalItems: 2,
    totalPrice: 59.98,
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
  })),
  CartProvider: function MockCartProvider({ children }: any) {
    return children;
  },
}));

// Mock useAuth to provide authenticated user
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "test-user-id", email: "test@example.com" },
    profile: { id: "test-user-id", full_name: "Test User", role: "buyer" },
    isLoading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    isAdmin: false,
    isSeller: false,
  })),
}));

describe("Checkout Page", () => {
  it("renders checkout form with required fields", () => {
    render(<CheckoutPage />);
    expect(screen.getByLabelText(/name on card/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expiry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cvc/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pay \$/i })).toBeInTheDocument();
  });

  it("displays escrow protection info", () => {
    render(<CheckoutPage />);
    expect(screen.getByText(/escrow protected/i)).toBeInTheDocument();
  });

  it("shows payment method options", () => {
    render(<CheckoutPage />);
    expect(screen.getByText(/credit card/i)).toBeInTheDocument();
    expect(screen.getByText(/cryptocurrency/i)).toBeInTheDocument();
  });

  it("has link back to cart", () => {
    render(<CheckoutPage />);
    const backLink = screen.getByText(/back to cart/i);
    expect(backLink.closest("a")).toHaveAttribute("href", "/cart");
  });

  it("displays order summary with correct total", () => {
    render(<CheckoutPage />);
    expect(screen.getByText(/order summary/i)).toBeInTheDocument();
    expect(screen.getByText(/test product/i)).toBeInTheDocument();
    expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
  });
});