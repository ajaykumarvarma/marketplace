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

function renderWithCart(ui: React.ReactNode) {
  return render(<CartProvider>{ui}</CartProvider>);
}

describe("Checkout Page", () => {
  it("renders checkout form with required fields", () => {
    renderWithCart(<CheckoutPage />);

    expect(screen.getByText(/delivery email/i)).toBeInTheDocument();
    expect(screen.getByText(/payment method/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /complete purchase/i })).toBeInTheDocument();
  });

  it("displays escrow protection info", () => {
    renderWithCart(<CheckoutPage />);
    expect(screen.getByText(/escrow protected/i)).toBeInTheDocument();
    expect(screen.getByText(/money-back guarantee/i)).toBeInTheDocument();
  });

  it("shows payment method options", () => {
    renderWithCart(<CheckoutPage />);

    expect(screen.getByText(/credit card/i)).toBeInTheDocument();
    expect(screen.getByText(/paypal/i)).toBeInTheDocument();
    expect(screen.getByText(/crypto/i)).toBeInTheDocument();
  });

  it("has link back to cart", () => {
    renderWithCart(<CheckoutPage />);
    const backLink = screen.getByText(/back to cart/i);
    expect(backLink.closest("a")).toHaveAttribute("href", "/cart");
  });
});