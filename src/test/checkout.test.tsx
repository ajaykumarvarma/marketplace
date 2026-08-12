import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CheckoutPage from "@/pages/checkout/index";

// Mock next/router
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("Checkout Page", () => {
  it("renders checkout form with required fields", () => {
    render(<CheckoutPage />);

    expect(screen.getByText(/delivery email/i)).toBeInTheDocument();
    expect(screen.getByText(/payment method/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /complete purchase/i })).toBeInTheDocument();
  });

  it("displays escrow protection info", () => {
    render(<CheckoutPage />);
    expect(screen.getByText(/escrow protected/i)).toBeInTheDocument();
    expect(screen.getByText(/money-back guarantee/i)).toBeInTheDocument();
  });

  it("shows payment method options", () => {
    render(<CheckoutPage />);

    expect(screen.getByText(/credit card/i)).toBeInTheDocument();
    expect(screen.getByText(/paypal/i)).toBeInTheDocument();
    expect(screen.getByText(/crypto/i)).toBeInTheDocument();
  });

  it("has link back to cart", () => {
    render(<CheckoutPage />);
    const backLink = screen.getByText(/back to cart/i);
    expect(backLink.closest("a")).toHaveAttribute("href", "/cart");
  });
});