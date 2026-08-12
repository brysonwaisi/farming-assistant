import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import {
  login,
  signup,
  checkAuth,
  forgotpassword,
  resetpassword,
  subscriptions,
  loadCart,
  syncCart,
  loadWishlist,
  syncWishlist,
  updateProfile,
  uploadAvatar,
} from "./apiCalls";
import userReducer, { loginSuccess, type User } from "./userRedux";
import cartReducer, { type CartProduct } from "./cartRedux";
import subscriptionReducer from "./subscriptionRedux";
import wishlistReducer from "./wishlistRedux";
import { pubRequest, userRequest } from "../reqMethods";

vi.mock("../reqMethods", () => ({
  pubRequest: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
  userRequest: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

const pub = pubRequest as unknown as { get: Mock; post: Mock; put: Mock };
const authed = userRequest as unknown as { get: Mock; post: Mock; put: Mock };

const makeStore = () =>
  configureStore({
    reducer: {
      user: userReducer,
      cart: cartReducer,
      sub: subscriptionReducer,
      wishlist: wishlistReducer,
    },
  });

type Store = ReturnType<typeof makeStore>;
type Thunk = (dispatch: Store["dispatch"]) => Promise<void>;

const run = (store: Store, thunk: Thunk) => thunk(store.dispatch);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("login", () => {
  it("stores the user and hydrates cart + wishlist from the server", async () => {
    pub.post.mockResolvedValue({ data: { _id: "u1", username: "bryson" } });
    authed.get.mockImplementation((url: string) => {
      if (url === "/carts/find/u1") {
        return Promise.resolve({ data: { products: [{ productId: "p1", quantity: 2 }] } });
      }
      return Promise.resolve({ data: { products: [{ productId: "p2" }] } });
    });
    pub.get.mockImplementation((url: string) =>
      Promise.resolve({
        data: { _id: url.split("/").pop(), title: "T", price: 100, type: ["organic"] },
      })
    );

    const store = makeStore();
    await run(store, login({ username: "bryson", password: "pw" }));

    const state = store.getState();
    expect(pub.post).toHaveBeenCalledWith("/auth/login", { username: "bryson", password: "pw" });
    expect(state.user.isLoggedIn).toBe(true);
    expect(state.user.currentUser?._id).toBe("u1");
    expect(state.cart.products).toHaveLength(1);
    expect(state.cart.products[0]?.quantity).toBe(2);
    expect(state.wishlist.products).toHaveLength(1);
    expect(state.wishlist.products[0]?._id).toBe("p2");
  });

  it("flags an error on failure and stays logged out", async () => {
    pub.post.mockRejectedValue(new Error("bad creds"));
    const store = makeStore();
    await run(store, login({ username: "x", password: "y" }));
    expect(store.getState().user.error).toBe(true);
    expect(store.getState().user.isLoggedIn).toBe(false);
  });
});

describe("signup", () => {
  it("logs the new user in on success", async () => {
    pub.post.mockResolvedValue({ data: { _id: "u1", username: "new" } });
    const store = makeStore();
    await run(store, signup({ username: "new" }));
    expect(pub.post).toHaveBeenCalledWith("/auth/register", { username: "new" });
    expect(store.getState().user.isLoggedIn).toBe(true);
  });

  it("flags an error on failure", async () => {
    pub.post.mockRejectedValue(new Error("taken"));
    const store = makeStore();
    await run(store, signup({ username: "dupe" }));
    expect(store.getState().user.error).toBe(true);
  });
});

describe("checkAuth", () => {
  it("logs out the persisted session when the server says 401", async () => {
    authed.get.mockRejectedValue({ response: { status: 401 } });
    const store = makeStore();
    store.dispatch(loginSuccess({ _id: "u1", username: "stale" } as User));

    await checkAuth(store.dispatch);

    expect(store.getState().user.isLoggedIn).toBe(false);
    expect(store.getState().user.currentUser).toBeNull();
  });

  it("restores the session when the cookie is valid", async () => {
    authed.get.mockImplementation((url: string) => {
      if (url === "/auth/check-auth") {
        return Promise.resolve({ data: { user: { _id: "u1", username: "b" } } });
      }
      return Promise.resolve({ data: { products: [] } });
    });

    const store = makeStore();
    await checkAuth(store.dispatch);

    expect(store.getState().user.isLoggedIn).toBe(true);
    expect(store.getState().user.currentUser?._id).toBe("u1");
  });
});

describe("password flows", () => {
  it("forgotpassword marks the flow successful", async () => {
    pub.post.mockResolvedValue({ data: { success: true, message: "sent" } });
    const store = makeStore();
    await run(store, forgotpassword({ email: "a@x.com" }));
    expect(store.getState().user.passwordFlowSuccess).toBe(true);
    expect(store.getState().user.currentUser).toBeNull();
  });

  it("resetpassword posts to the tokened endpoint and marks success", async () => {
    pub.post.mockResolvedValue({ data: { success: true } });
    const store = makeStore();
    await run(store, resetpassword({ token: "tok123", password: "NewPw1!" }));
    expect(pub.post).toHaveBeenCalledWith("/auth/reset-password/tok123", { password: "NewPw1!" });
    expect(store.getState().user.passwordFlowSuccess).toBe(true);
  });

  it("resetpassword failure flags an error", async () => {
    pub.post.mockRejectedValue(new Error("expired"));
    const store = makeStore();
    await run(store, resetpassword({ token: "bad", password: "x" }));
    expect(store.getState().user.error).toBe(true);
    expect(store.getState().user.passwordFlowSuccess).toBe(false);
  });
});

describe("subscriptions", () => {
  it("marks success after subscribing", async () => {
    pub.post.mockResolvedValue({ data: { message: "ok" } });
    const store = makeStore();
    await run(store, subscriptions({ email: "a@x.com" }));
    expect(pub.post).toHaveBeenCalledWith("/subscribe", { email: "a@x.com" });
    expect(store.getState().sub).toEqual({ isLoading: false, success: true, error: false });
  });

  it("marks an error on failure", async () => {
    pub.post.mockRejectedValue(new Error("nope"));
    const store = makeStore();
    await run(store, subscriptions({ email: "a@x.com" }));
    expect(store.getState().sub).toEqual({ isLoading: false, success: false, error: true });
  });
});

describe("cart + wishlist sync", () => {
  it("loadCart sets an empty cart when the server has none", async () => {
    authed.get.mockResolvedValue({ data: null });
    const store = makeStore();
    await loadCart(store.dispatch, "u1");
    expect(store.getState().cart.products).toHaveLength(0);
  });

  it("syncCart PUTs the cart as productId + quantity lines", async () => {
    authed.put.mockResolvedValue({ data: {} });
    const products = [
      { _id: "p1", quantity: 3, price: 100, type: "organic", title: "T" },
    ] as CartProduct[];
    await syncCart("u1", products);
    expect(authed.put).toHaveBeenCalledWith("/carts/find/u1", {
      userId: "u1",
      products: [{ productId: "p1", quantity: 3 }],
    });
  });

  it("syncCart swallows network errors (best-effort)", async () => {
    authed.put.mockRejectedValue(new Error("offline"));
    await expect(syncCart("u1", [])).resolves.toBeUndefined();
  });

  it("loadWishlist hydrates product details", async () => {
    authed.get.mockResolvedValue({ data: { products: [{ productId: "p2" }] } });
    pub.get.mockResolvedValue({ data: { _id: "p2", title: "Kale" } });
    const store = makeStore();
    await loadWishlist(store.dispatch, "u1");
    expect(store.getState().wishlist.products).toEqual([{ _id: "p2", title: "Kale" }]);
  });

  it("syncWishlist PUTs productId lines", async () => {
    authed.put.mockResolvedValue({ data: {} });
    await syncWishlist("u1", [{ _id: "p2" }]);
    expect(authed.put).toHaveBeenCalledWith("/wishlist/find/u1", {
      products: [{ productId: "p2" }],
    });
  });
});

describe("profile", () => {
  it("updateProfile merges returned fields into the current user", async () => {
    authed.put.mockResolvedValue({ data: { username: "renamed" } });
    const store = makeStore();
    store.dispatch(loginSuccess({ _id: "u1", username: "old", email: "e@x.com" } as User));

    const result = await updateProfile(store.dispatch, "u1", { username: "renamed" });

    expect(result).toEqual({ ok: true });
    expect(store.getState().user.currentUser).toMatchObject({
      _id: "u1",
      username: "renamed",
      email: "e@x.com",
    });
  });

  it("updateProfile surfaces the server error message", async () => {
    authed.put.mockRejectedValue({ response: { data: { message: "Username taken" } } });
    const store = makeStore();
    const result = await updateProfile(store.dispatch, "u1", { username: "dupe" });
    expect(result).toEqual({ ok: false, message: "Username taken" });
  });

  it("uploadAvatar presigns, uploads, then saves the file URL on the profile", async () => {
    authed.post.mockResolvedValue({
      data: { uploadUrl: "https://s3/upload", fileUrl: "https://cdn/avatar.png" },
    });
    authed.put.mockResolvedValue({ data: { image: "https://cdn/avatar.png" } });
    const fetchMock = vi.fn().mockResolvedValue({});
    vi.stubGlobal("fetch", fetchMock);

    const store = makeStore();
    store.dispatch(loginSuccess({ _id: "u1", username: "b" } as User));
    const file = new File(["x"], "a.png", { type: "image/png" });

    const result = await uploadAvatar(store.dispatch, "u1", file);

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("https://s3/upload", expect.objectContaining({ method: "PUT" }));
    expect(store.getState().user.currentUser?.image).toBe("https://cdn/avatar.png");
    vi.unstubAllGlobals();
  });
});
