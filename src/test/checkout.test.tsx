import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CheckoutPage from "@/pages/checkout/index";
import { CartProvider } from "@/contexts/CartContext";

// Mock next/router
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}

function renderCheckout() {
  // Pre-seed localStorage with a cart item so checkout shows the form, not empty state
  const seededCart = JSON.stringify([
    { id: "test-prod-1", title: "Test Product", price: 29.99, seller: "TestSeller", quantity: 2 },
  ]);
  localStorage.setItem("tradevault-cart", seededCart);
  const result = render(<TestWrapper><CheckoutPage /></TestWrapper>);
  return result;
}

describe("Checkout Page", () => {
  it("renders checkout form with required fields", () => {
    renderCheckout();
    expect(screen.getByText(/delivery email/i)).toBeInTheDocument();
    expect(screen.getByText(/payment method/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /complete purchase/i })).toBeInTheDocument();
  });

  it("displays escrow protection info", () => {
    renderCheckout();
    expect(screen.getByText(/escrow protected/i)).toBeInTheDocument();
    expect(screen.getByText(/money-back guarantee/i)).toBeInTheDocument();
  });

  it("shows payment method options", () => {
    renderCheckout();
    expect(screen.getByText(/credit card/i)).toBeInTheDocument();
    expect(screen.getByText(/paypal/i)).toBeInTheDocument();
    expect(screen.getByText(/crypto/i)).toBeInTheDocument();
  });

  it("has link back to cart", () => {
    renderCheckout();
    const backLink = screen.getByText(/back to cart/i);
    expect(backLink.closest("a")).toHaveAttribute("href", "/cart");
  });
});