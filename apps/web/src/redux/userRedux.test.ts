import { describe, it, expect } from "vitest";
import reducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  signupSuccess,
  forgotpasswordSuccess,
  logout,
} from "./userRedux";
import type { User, UserState } from "./userRedux";

const initial: UserState = {
  currentUser: null,
  isFetching: false,
  error: false,
  isLoggedIn: false,
  passwordFlowSuccess: false,
};

describe("userRedux", () => {
  it("loginSuccess sets currentUser + isLoggedIn and clears flags", () => {
    let state = reducer(initial, loginStart());
    expect(state.isFetching).toBe(true);
    state = reducer(state, loginSuccess({ _id: "1", username: "a" } as User));
    expect(state.isLoggedIn).toBe(true);
    expect(state.currentUser!.username).toBe("a");
    expect(state.isFetching).toBe(false);
    expect(state.error).toBe(false);
  });

  it("loginFailure flags an error and stays logged out", () => {
    const state = reducer(initial, loginFailure());
    expect(state.error).toBe(true);
    expect(state.isLoggedIn).toBe(false);
  });

  it("signupSuccess logs the user in (cookie issued on register)", () => {
    const state = reducer(initial, signupSuccess({ _id: "1", username: "a" } as User));
    expect(state.isLoggedIn).toBe(true);
    expect(state.currentUser).toBeTruthy();
  });

  it("forgotpasswordSuccess never writes the {message} payload into currentUser", () => {
    // forgotpasswordSuccess ignores its payload; the body is passed through a cast
    // to prove the {success, message} response never reaches currentUser.
    const forgot = forgotpasswordSuccess as unknown as (
      payload: { success: boolean; message: string }
    ) => ReturnType<typeof forgotpasswordSuccess>;
    const state = reducer(initial, forgot({ success: true, message: "sent" }));
    expect(state.currentUser).toBeNull();
    expect(state.passwordFlowSuccess).toBe(true);
  });

  it("logout resets the whole session", () => {
    const loggedIn: UserState = {
      currentUser: { _id: "1" } as User, isFetching: false, error: true, isLoggedIn: true, passwordFlowSuccess: true,
    };
    const state = reducer(loggedIn, logout());
    expect(state.currentUser).toBeNull();
    expect(state.isLoggedIn).toBe(false);
    expect(state.error).toBe(false);
  });
});
