import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CartProvider, useCart } from "@/contexts/CartContext";

function TestComponent() {
  const { items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  return (
    <div>
      <div data-testid="total-items">{totalItems}</div>
      <div data-testid="total-price">{totalPrice.toFixed(2)}</div>
      <div data-testid="item-count">{items.length}</div>
      <button
        data-testid="add-item"
        onClick={() => addItem({ id: "test-1", title: "Test Product", price: 9.99, seller: "TestSeller" })}
      >
        Add Item
      </button>
      <button
        data-testid="remove-item"
        onClick={() => removeItem("test-1")}
      >
        Remove Item
      </button>
      <button
        data-testid="update-qty"
        onClick={() => updateQuantity("test-1", 3)}
      >
        Update Qty
      </button>
      <button
        data-testid="clear-cart"
        onClick={() => clearCart()}
      >
        Clear Cart
      </button>
      {items.map((item) => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          {item.title} - {item.quantity}
        </div>
      ))}
    </div>
  );
}

describe("Cart Context", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds item to cart", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId("add-item"));

    expect(screen.getByTestId("total-items")).toHaveTextContent("1");
    expect(screen.getByTestId("total-price")).toHaveTextContent("9.99");
    expect(screen.getByTestId("item-test-1")).toHaveTextContent("Test Product - 1");
  });

  it("increments quantity when adding same item", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId("add-item"));
    fireEvent.click(screen.getByTestId("add-item"));

    expect(screen.getByTestId("total-items")).toHaveTextContent("2");
    expect(screen.getByTestId("item-test-1")).toHaveTextContent("Test Product - 2");
  });

  it("removes item from cart", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId("add-item"));
    fireEvent.click(screen.getByTestId("remove-item"));

    expect(screen.getByTestId("total-items")).toHaveTextContent("0");
    expect(screen.getByTestId("item-count")).toHaveTextContent("0");
  });

  it("updates item quantity", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId("add-item"));
    fireEvent.click(screen.getByTestId("update-qty"));

    expect(screen.getByTestId("total-items")).toHaveTextContent("3");
    expect(screen.getByTestId("item-test-1")).toHaveTextContent("Test Product - 3");
  });

  it("clears all items", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId("add-item"));
    fireEvent.click(screen.getByTestId("clear-cart"));

    expect(screen.getByTestId("total-items")).toHaveTextContent("0");
    expect(screen.getByTestId("item-count")).toHaveTextContent("0");
  });
});