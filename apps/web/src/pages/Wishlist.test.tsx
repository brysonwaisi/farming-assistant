import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Wishlist from "./Wishlist";
import { renderWithProviders } from "../test/renderWithProviders";

type PreloadedState = NonNullable<Parameters<typeof renderWithProviders>[1]>["preloadedState"];

vi.mock("../redux/apiCalls", () => ({
  syncWishlist: vi.fn(),
}));

const withItems = {
  user: { currentUser: { _id: "u1" }, isLoggedIn: true },
  wishlist: {
    products: [
      { _id: "p1", title: "Tomatoes", price: 100, img: "/t.jpg", type: ["organic"] },
    ],
  },
} as unknown as PreloadedState;

describe("Wishlist page", () => {
  it("lists the wished products with a count", () => {
    renderWithProviders(<Wishlist />, { preloadedState: withItems });
    expect(screen.getByText("Tomatoes")).toBeInTheDocument();
    expect(screen.getByText(/1 item\(s\)/)).toBeInTheDocument();
  });

  it("moves an item to the cart with quantity 1 and normalized type", async () => {
    const { store } = renderWithProviders(<Wishlist />, { preloadedState: withItems });

    await userEvent.click(screen.getByRole("button", { name: /move to cart/i }));

    const cart = store.getState().cart;
    expect(cart.products).toHaveLength(1);
    expect(cart.products[0]).toMatchObject({ _id: "p1", quantity: 1, type: "organic" });
    expect(store.getState().wishlist.products).toHaveLength(0);
    expect(screen.getByText(/your wishlist is empty/i)).toBeInTheDocument();
  });

  it("removes an item without touching the cart", async () => {
    const { store } = renderWithProviders(<Wishlist />, { preloadedState: withItems });

    await userEvent.click(screen.getByRole("button", { name: /remove/i }));

    expect(store.getState().wishlist.products).toHaveLength(0);
    expect(store.getState().cart.products).toHaveLength(0);
  });

  it("shows the empty state when there is nothing wished", () => {
    renderWithProviders(<Wishlist />);
    expect(screen.getByText(/your wishlist is empty/i)).toBeInTheDocument();
  });
});
