import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/pages/auth/login";

describe("Auth Form Validation", () => {
  it("renders login form with email and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows password toggle button", () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const toggleBtn = screen.getByRole("button", { name: "" });

    expect(passwordInput.type).toBe("password");
  });

  it("displays rate limiting warning after failed attempts", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    // Submit 5 times to trigger lock
    for (let i = 0; i < 5; i++) {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
      fireEvent.click(submitBtn);
    }

    await waitFor(() => {
      expect(screen.getByText(/account temporarily locked/i)).toBeInTheDocument();
    });
  });

  it("shows SSL security badge", () => {
    render(<LoginPage />);
    expect(screen.getByText(/256-bit SSL encrypted/i)).toBeInTheDocument();
  });
});

describe("Auth Navigation Links", () => {
  it("has link to forgot password page", () => {
    render(<LoginPage />);
    const forgotLink = screen.getByText(/forgot password/i);
    expect(forgotLink.closest("a")).toHaveAttribute("href", "/auth/forgot-password");
  });

  it("has link to register page", () => {
    render(<LoginPage />);
    const registerLink = screen.getByText(/create one/i);
    expect(registerLink.closest("a")).toHaveAttribute("href", "/auth/register");
  });
});