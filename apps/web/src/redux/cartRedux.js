import { createSlice } from "@reduxjs/toolkit";

const normalizeType = (type) => {
  if (Array.isArray(type)) return type[0] || "";
  return type || "";
};

const recompute = (state) => {
  state.quantity = state.products.reduce((n, p) => n + (Number(p.quantity) || 0), 0);
  state.total = state.products.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
    0
  );
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    products: [],
    quantity: 0,
    total: 0,
  },
  reducers: {
    addProduct: (state, action) => {
      const incoming = { ...action.payload, type: normalizeType(action.payload.type) };
      const qty = Number(incoming.quantity) || 1;
      const existing = state.products.find(
        (p) => p._id === incoming._id && p.type === incoming.type
      );
      if (existing) {
        existing.quantity += qty;
      } else {
        state.products.push({ ...incoming, quantity: qty });
      }
      recompute(state);
    },
    updateQuantity: (state, action) => {
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
    removeProduct: (state, action) => {
      const { _id } = action.payload;
      const type = normalizeType(action.payload.type);
      state.products = state.products.filter(
        (p) => !(p._id === _id && normalizeType(p.type) === type)
      );
      recompute(state);
    },
    setCart: (state, action) => {
      const products = action.payload?.products || [];
      state.products = products.map((p) => ({
        ...p,
        type: normalizeType(p.type),
        quantity: Number(p.quantity) || 1,
      }));
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
