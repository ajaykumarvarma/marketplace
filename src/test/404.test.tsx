import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFoundPage from "@/pages/404";

describe("404 Page", () => {
  it("renders 404 page with correct heading", () => {
    render(<NotFoundPage />);
    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
    expect(screen.getByText(/this page doesn't exist or has been moved/i)).toBeInTheDocument();
  });

  it("has navigation links back to home and marketplace", () => {
    render(<NotFoundPage />);

    const homeLink = screen.getByText(/back to home/i);
    expect(homeLink.closest("a")).toHaveAttribute("href", "/");

    const marketplaceLink = screen.getByText(/browse marketplace/i);
    expect(marketplaceLink.closest("a")).toHaveAttribute("href", "/marketplace");
  });

  it("displays in dark theme", () => {
    const { container } = render(<NotFoundPage />);
    expect(container.querySelector("main")).toHaveClass("bg-background");
  });
});