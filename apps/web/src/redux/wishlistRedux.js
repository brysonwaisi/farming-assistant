import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    products: [],
  },
  reducers: {
    toggleWishlist: (state, action) => {
      const item = action.payload;
      const idx = state.products.findIndex((p) => p._id === item._id);
      if (idx >= 0) {
        state.products.splice(idx, 1);
      } else {
        state.products.push(item);
      }
    },
    addToWishlist: (state, action) => {
      const item = action.payload;
      if (!state.products.find((p) => p._id === item._id)) {
        state.products.push(item);
      }
    },
    removeFromWishlist: (state, action) => {
      state.products = state.products.filter((p) => p._id !== action.payload);
    },
    setWishlist: (state, action) => {
      state.products = action.payload?.products || [];
    },
    clearWishlist: (state) => {
      state.products = [];
    },
  },
});

export const {
  toggleWishlist,
  addToWishlist,
  removeFromWishlist,
  setWishlist,
  clearWishlist,
} = wishlistSlice.actions;
export default wishlistSlice.reducer;
