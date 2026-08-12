import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import Product, { ProductItem } from "./Product";
import { renderWithProviders } from "../test/renderWithProviders";

const item: ProductItem = {
  _id: "p1",
  title: "Tomatoes",
  img: "/tomato.jpg",
  price: 100,
  type: ["organic"],
};

// Surfaces the current router path so we can assert navigation without mocking.
const LocationProbe = () => {
  const { pathname } = useLocation();
  return <div data-testid="path">{pathname}</div>;
};

describe("Product card", () => {
  it("renders the product image with its title as alt text", () => {
    renderWithProviders(<Product item={item} />);
    expect(screen.getByAltText("Tomatoes")).toBeInTheDocument();
  });

  it("adds the product to the cart when the cart icon is clicked", async () => {
    const { store } = renderWithProviders(<Product item={item} />);
    await userEvent.click(screen.getByTitle("Add to cart"));
    const { cart } = store.getState();
    expect(cart.products).toHaveLength(1);
    expect(cart.products[0]!._id).toBe("p1");
    expect(cart.products[0]!.type).toBe("organic"); // normalized from array
  });

  it("toggles the product in the wishlist via the heart icon", async () => {
    const { store } = renderWithProviders(<Product item={item} />);
    await userEvent.click(screen.getByTitle("Add to wishlist"));
    expect(store.getState().wishlist.products).toHaveLength(1);
    // now it should show as wished -> clicking removes it
    await userEvent.click(screen.getByTitle("Remove from wishlist"));
    expect(store.getState().wishlist.products).toHaveLength(0);
  });

  it("navigates to the product detail page when the card is clicked", async () => {
    renderWithProviders(
      <>
        <Product item={item} />
        <LocationProbe />
      </>,
    );
    await userEvent.click(screen.getByAltText("Tomatoes"));
    expect(screen.getByTestId("path").textContent).toBe("/product/p1");
  });

  it("renders a fallback when no item is provided", () => {
    renderWithProviders(<Product item={null} />);
    expect(screen.getByText(/no item available/i)).toBeInTheDocument();
  });
});
