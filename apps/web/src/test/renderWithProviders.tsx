import { combineReducers, configureStore } from "@reduxjs/toolkit";
import type { PreloadedState } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import type { RenderResult } from "@testing-library/react";
import type { ReactNode } from "react";
import cartReducer from "../redux/cartRedux";
import userReducer from "../redux/userRedux";
import subscriptionReducer from "../redux/subscriptionRedux";
import wishlistReducer from "../redux/wishlistRedux";

// Derive the test store's state shape from the reducer map so preloadedState
// and the returned store are precisely typed (this store omits redux-persist).
const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
  sub: subscriptionReducer,
  wishlist: wishlistReducer,
});

type TestRootState = ReturnType<typeof rootReducer>;
type TestStore = ReturnType<typeof configureStore<TestRootState>>;

interface RenderWithProvidersOptions {
  preloadedState?: PreloadedState<TestRootState>;
  route?: string;
}

type RenderWithProvidersResult = RenderResult & { store: TestStore };

export const renderWithProviders = (
  ui: ReactNode,
  { preloadedState, route = "/" }: RenderWithProvidersOptions = {},
): RenderWithProvidersResult => {
  const store = configureStore({
    reducer: {
      user: userReducer,
      cart: cartReducer,
      sub: subscriptionReducer,
      wishlist: wishlistReducer,
    },
    preloadedState,
  });

  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>,
  );
  return { store, ...utils };
};
