import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import Cart from "./Cart";
import { renderWithProviders } from "../test/renderWithProviders";

// CheckoutModal pulls in the Stripe SDK; stub it so the Cart renders in jsdom.
vi.mock("../components/CheckoutModal", () => ({
  default: () => <div data-testid="checkout-modal" />,
}));

// Cart syncs to the server for logged-in users; stub it (no network in tests).
vi.mock("../redux/apiCalls", () => ({ syncCart: vi.fn() }));

const LocationProbe = () => {
  const { pathname, search } = useLocation();
  return <div data-testid="path">{pathname + search}</div>;
};

const cartWithItem = {
  cart: {
    products: [{ _id: "p1", title: "Tomatoes", img: "/t.jpg", price: 100, quantity: 2, type: "organic" }],
    quantity: 2,
    total: 200,
  },
};

describe("Cart checkout gating", () => {
  it("redirects a guest to login (with return path) instead of opening checkout", async () => {
    renderWithProviders(
      <>
        <Cart />
        <LocationProbe />
      </>,
      { preloadedState: { ...cartWithItem, user: { currentUser: null, isLoggedIn: false } } },
    );

    // there are two CHECKOUT NOW buttons (top + summary); click the first
    const buttons = screen.getAllByRole("button", { name: /checkout now/i });
    await userEvent.click(buttons[0]);

    expect(screen.getByTestId("path").textContent).toBe("/login?redirect=/cart");
    expect(screen.queryByTestId("checkout-modal")).not.toBeInTheDocument();
  });

  it("opens the checkout modal for a logged-in user", async () => {
    renderWithProviders(
      <>
        <Cart />
        <LocationProbe />
      </>,
      {
        preloadedState: {
          ...cartWithItem,
          user: { currentUser: { _id: "u1" }, isLoggedIn: true },
        },
      },
    );

    const buttons = screen.getAllByRole("button", { name: /checkout now/i });
    await userEvent.click(buttons[buttons.length - 1]);

    expect(screen.getByTestId("checkout-modal")).toBeInTheDocument();
    expect(screen.getByTestId("path").textContent).toBe("/");
  });

  it("renders the cart item and its KES totals", () => {
    renderWithProviders(<Cart />, {
      preloadedState: { ...cartWithItem, user: { currentUser: { _id: "u1" }, isLoggedIn: true } },
    });
    expect(screen.getByText("Tomatoes")).toBeInTheDocument();
    // "KES 200" appears for the line price + subtotal + total
    const totals = screen.getAllByText((_, el) => el?.textContent === "KES 200");
    expect(totals.length).toBeGreaterThan(0);
  });

  it("removes the item when its quantity is decremented to zero", async () => {
    const oneItem = {
      cart: {
        products: [{ _id: "p1", title: "Tomatoes", img: "/t.jpg", price: 100, quantity: 1, type: "organic" }],
        quantity: 1,
        total: 100,
      },
    };
    const { store } = renderWithProviders(<Cart />, {
      preloadedState: { ...oneItem, user: { currentUser: null, isLoggedIn: false } },
    });
    await userEvent.click(screen.getByLabelText("Decrease quantity"));
    expect(store.getState().cart.products).toHaveLength(0);
  });
});
