import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { screen } from "@testing-library/react";
import Success from "./Success";
import { userRequest } from "../reqMethods";
import { renderWithProviders } from "../test/renderWithProviders";

type PreloadedState = NonNullable<Parameters<typeof renderWithProviders>[1]>["preloadedState"];

vi.mock("../reqMethods", () => ({
  userRequest: { get: vi.fn(), post: vi.fn() },
}));

const authed = userRequest as unknown as { get: Mock; post: Mock };

const checkoutState = {
  user: { currentUser: { _id: "u1" }, isLoggedIn: true },
  cart: {
    products: [{ _id: "p1", title: "Tomatoes", price: 100, quantity: 2, type: "organic" }],
    quantity: 2,
    total: 200,
  },
} as unknown as PreloadedState;

beforeEach(() => {
  authed.get.mockReset();
  authed.post.mockReset();
});

describe("Success page", () => {
  it("creates the order and clears the cart after a paid session", async () => {
    authed.get.mockResolvedValue({ data: { paymentStatus: "paid" } });
    authed.post.mockResolvedValue({ data: { _id: "order42" } });

    const { store } = renderWithProviders(<Success />, {
      route: "/success?session_id=cs_1",
      preloadedState: checkoutState,
    });

    expect(await screen.findByText(/order42/)).toBeInTheDocument();
    expect(authed.get).toHaveBeenCalledWith("/checkout/session/cs_1");
    expect(authed.post).toHaveBeenCalledWith("/orders", {
      userId: "u1",
      products: [{ productId: "p1", quantity: 2 }],
      amount: 200,
      address: {},
    });
    expect(store.getState().cart.products).toHaveLength(0);
  });

  it("shows an error and creates no order for an unpaid session", async () => {
    authed.get.mockResolvedValue({ data: { paymentStatus: "unpaid" } });

    renderWithProviders(<Success />, {
      route: "/success?session_id=cs_1",
      preloadedState: checkoutState,
    });

    expect(await screen.findByText(/couldn't confirm your payment/i)).toBeInTheDocument();
    expect(authed.post).not.toHaveBeenCalled();
  });

  it("shows an error when order creation fails", async () => {
    authed.get.mockResolvedValue({ data: { paymentStatus: "paid" } });
    authed.post.mockRejectedValue(new Error("500"));

    renderWithProviders(<Success />, {
      route: "/success?session_id=cs_1",
      preloadedState: checkoutState,
    });

    expect(await screen.findByText(/couldn't confirm your payment/i)).toBeInTheDocument();
  });

  it("shows a generic success without server calls when the cart is empty", () => {
    renderWithProviders(<Success />, { route: "/success?session_id=cs_1" });

    expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
    expect(authed.get).not.toHaveBeenCalled();
    expect(authed.post).not.toHaveBeenCalled();
  });
});
