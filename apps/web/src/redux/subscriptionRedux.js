import { createSlice } from "@reduxjs/toolkit";

const subscriptionSlice = createSlice({
  name: "sub",
  initialState : {
  isLoading: false,
  success: false,
  error: false,
},
  reducers: {
    subscriptionStart: (state) => {
      state.isLoading = true;
      state.success = false;
      state.error = false;
    },
    subscriptionSuccess: (state, action) => {
      state.isLoading = false;
      state.success = action.payload;
      state.error = false;
    },
    subscriptionFailure: (state) => {
      state.isLoading = false;
      state.success = false;
      state.error = true;
    },
}
});


export const {
  subscriptionStart,
  subscriptionSuccess,
  subscriptionFailure,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;