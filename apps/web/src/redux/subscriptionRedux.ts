import { createSlice } from "@reduxjs/toolkit";

export interface SubscriptionState {
  isLoading: boolean;
  success: boolean;
  error: boolean;
}

const initialState: SubscriptionState = {
  isLoading: false,
  success: false,
  error: false,
};

const subscriptionSlice = createSlice({
  name: "sub",
  initialState,
  reducers: {
    subscriptionStart: (state) => {
      state.isLoading = true;
      state.success = false;
      state.error = false;
    },
    subscriptionSuccess: (state) => {
      state.isLoading = false;
      state.success = true;
      state.error = false;
    },
    subscriptionFailure: (state) => {
      state.isLoading = false;
      state.success = false;
      state.error = true;
    },
  },
});


export const {
  subscriptionStart,
  subscriptionSuccess,
  subscriptionFailure,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
