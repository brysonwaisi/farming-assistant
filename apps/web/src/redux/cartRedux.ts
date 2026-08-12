import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// A product line as stored in the cart: `type` and `quantity` are normalized.
// Extra server/product fields ride along via spread, so allow an index signature.
export interface CartProduct {
  _id: string;
  price: number;
  type: string;
  quantity: number;
  [key: string]: unknown;
}

// Incoming payload shapes are looser: `type` may be a string or array (server),
// and price/quantity may be missing.
interface ProductPayload {
  _id: string;
  type?: string | string[];
  price?: number;
  quantity?: number;
  [key: string]: unknown;
}

export interface CartState {
  products: CartProduct[];
  quantity: number;
  total: number;
}

const normalizeType = (type: unknown): string => {
  if (Array.isArray(type)) return type[0] || "";
  return (type as string) || "";
};

const recompute = (state: CartState) => {
  state.quantity = state.products.reduce((n, p) => n + (Number(p.quantity) || 0), 0);
  state.total = state.products.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
    0
  );
};

const initialState: CartState = {
  products: [],
  quantity: 0,
  total: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<ProductPayload>) => {
      const incoming = { ...action.payload, type: normalizeType(action.payload.type) };
      const qty = Number(incoming.quantity) || 1;
      const existing = state.products.find(
        (p) => p._id === incoming._id && p.type === incoming.type
      );
      if (existing) {
        existing.quantity += qty;
      } else {
        state.products.push({ ...incoming, quantity: qty } as CartProduct);
      }
      recompute(state);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ _id: string; quantity: number; type?: string | string[] }>
    ) => {
      const { _id, quantity } = action.payload;
      const type = normalizeType(action.payload.type);
      const item = state.products.find(
        (p) => p._id === _id && normalizeType(p.type) === type
      );
      if (item) {
        item.quantity = Math.max(1, quantity);
        recompute(state);
      }
    },
    removeProduct: (
      state,
      action: PayloadAction<{ _id: string; type?: string | string[] }>
    ) => {
      const { _id } = action.payload;
      const type = normalizeType(action.payload.type);
      state.products = state.products.filter(
        (p) => !(p._id === _id && normalizeType(p.type) === type)
      );
      recompute(state);
    },
    setCart: (
      state,
      action: PayloadAction<{ products?: ProductPayload[] } | undefined>
    ) => {
      const products = action.payload?.products || [];
      state.products = products.map((p) => ({
        ...p,
        type: normalizeType(p.type),
        quantity: Number(p.quantity) || 1,
      })) as CartProduct[];
      recompute(state);
    },
    clearCart: (state) => {
      state.products = [];
      state.quantity = 0;
      state.total = 0;
    },
  },
});

export const {
  addProduct,
  updateQuantity,
  removeProduct,
  setCart,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
