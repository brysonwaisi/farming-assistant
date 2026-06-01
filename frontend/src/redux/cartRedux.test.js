import { describe, it, expect } from "vitest";
import reducer, {
  addProduct,
  updateQuantity,
  removeProduct,
  setCart,
  clearCart,
} from "./cartRedux";

const initial = { products: [], quantity: 0, total: 0 };
const prod = (over = {}) => ({ _id: "p1", price: 100, type: "organic", ...over });

describe("cartRedux", () => {
  it("adds a product and recomputes quantity + total", () => {
    const state = reducer(initial, addProduct({ ...prod(), quantity: 2 }));
    expect(state.products).toHaveLength(1);
    expect(state.quantity).toBe(2);
    expect(state.total).toBe(200);
  });

  it("dedupes by id + type, bumping quantity instead of duplicating", () => {
    let state = reducer(initial, addProduct({ ...prod(), quantity: 1 }));
    state = reducer(state, addProduct({ ...prod(), quantity: 2 }));
    expect(state.products).toHaveLength(1);
    expect(state.products[0].quantity).toBe(3);
    expect(state.total).toBe(300);
  });

  it("treats different types as separate lines", () => {
    let state = reducer(initial, addProduct(prod({ type: "organic", quantity: 1 })));
    state = reducer(state, addProduct(prod({ type: "fat", quantity: 1 })));
    expect(state.products).toHaveLength(2);
  });

  it("normalizes an array type to a string (server-loaded shape)", () => {
    const state = reducer(initial, addProduct({ _id: "p1", price: 50, type: ["organic"], quantity: 1 }));
    expect(state.products[0].type).toBe("organic");
  });

  it("updateQuantity clamps to a minimum of 1 and matches array/string type", () => {
    let state = reducer(initial, addProduct(prod({ quantity: 5 })));
    state = reducer(state, updateQuantity({ _id: "p1", type: ["organic"], quantity: 0 }));
    expect(state.products[0].quantity).toBe(1);
    expect(state.total).toBe(100);
  });

  it("removeProduct removes the matching line and recomputes", () => {
    let state = reducer(initial, addProduct(prod({ quantity: 2 })));
    state = reducer(state, removeProduct({ _id: "p1", type: "organic" }));
    expect(state.products).toHaveLength(0);
    expect(state.total).toBe(0);
    expect(state.quantity).toBe(0);
  });

  it("setCart replaces products and never yields NaN totals", () => {
    const state = reducer(initial, setCart({
      products: [{ _id: "x", price: undefined, quantity: undefined, type: ["a"] }],
    }));
    expect(Number.isNaN(state.total)).toBe(false);
    expect(state.products[0].quantity).toBe(1);
  });

  it("clearCart empties the cart", () => {
    let state = reducer(initial, addProduct(prod({ quantity: 3 })));
    state = reducer(state, clearCart());
    expect(state).toEqual(initial);
  });
});
