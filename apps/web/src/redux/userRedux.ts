import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  _id: string;
  username: string;
  email: string;
  isVerified?: boolean;
  image?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface UserState {
  currentUser: User | null;
  isFetching: boolean;
  error: boolean;
  isLoggedIn: boolean;
  passwordFlowSuccess: boolean;
}

const initialState: UserState = {
  currentUser: null,
  isFetching: false,
  error: false,
  isLoggedIn: false,
  passwordFlowSuccess: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isFetching = false;
      state.error = false;
      state.currentUser = action.payload;
      state.isLoggedIn = true;
    },
    loginFailure: (state) => {
      state.isFetching = false;
      state.error = true;
      state.isLoggedIn = false;
    },
    signupStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    signupSuccess: (state, action: PayloadAction<User>) => {
      state.isFetching = false;
      state.error = false;
      state.currentUser = action.payload;
      state.isLoggedIn = true;
    },
    signupFailure: (state) => {
      state.isFetching = false;
      state.error = true;
      state.isLoggedIn = false;
    },
    forgotpasswordStart: (state) => {
      state.isFetching = true;
      state.error = false;
      state.passwordFlowSuccess = false;
    },
    // forgot/reset responses are {success, message} — never write to currentUser.
    forgotpasswordSuccess: (state) => {
      state.isFetching = false;
      state.passwordFlowSuccess = true;
    },
    forgotpasswordFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
    resetpasswordStart: (state) => {
      state.isFetching = true;
      state.error = false;
      state.passwordFlowSuccess = false;
    },
    resetpasswordSuccess: (state) => {
      state.isFetching = false;
      state.passwordFlowSuccess = true;
    },
    resetpasswordFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
    // Merge updated profile fields into the current user (after a profile edit).
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.isLoggedIn = false;
      state.isFetching = false;
      state.error = false;
      state.passwordFlowSuccess = false;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
  forgotpasswordStart,
  forgotpasswordSuccess,
  forgotpasswordFailure,
  resetpasswordStart,
  resetpasswordSuccess,
  resetpasswordFailure,
  updateUser,
  logout,
} = userSlice.actions;
export default userSlice.reducer;
