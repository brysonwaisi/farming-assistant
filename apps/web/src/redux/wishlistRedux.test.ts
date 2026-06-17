import { describe, it, expect } from "vitest";
import reducer, {
  toggleWishlist,
  addToWishlist,
  removeFromWishlist,
  setWishlist,
  clearWishlist,
  WishlistProduct,
  WishlistState,
} from "./wishlistRedux";

const initial: WishlistState = { products: [] };
const item = (id: string): WishlistProduct => ({ _id: id, title: `p${id}` });

describe("wishlistRedux", () => {
  it("toggle adds when absent and removes when present", () => {
    let state = reducer(initial, toggleWishlist(item("1")));
    expect(state.products).toHaveLength(1);
    state = reducer(state, toggleWishlist(item("1")));
    expect(state.products).toHaveLength(0);
  });

  it("addToWishlist does not duplicate", () => {
    let state = reducer(initial, addToWishlist(item("1")));
    state = reducer(state, addToWishlist(item("1")));
    expect(state.products).toHaveLength(1);
  });

  it("removeFromWishlist removes by id", () => {
    let state = reducer(initial, addToWishlist(item("1")));
    state = reducer(state, removeFromWishlist("1"));
    expect(state.products).toHaveLength(0);
  });

  it("setWishlist replaces and clearWishlist empties", () => {
    let state = reducer(initial, setWishlist({ products: [item("1"), item("2")] }));
    expect(state.products).toHaveLength(2);
    state = reducer(state, clearWishlist());
    expect(state.products).toHaveLength(0);
  });
});
