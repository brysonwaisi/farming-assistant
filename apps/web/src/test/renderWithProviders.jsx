import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import cartReducer from "../redux/cartRedux";
import userReducer from "../redux/userRedux";
import subscriptionReducer from "../redux/subscriptionRedux";
import wishlistReducer from "../redux/wishlistRedux";

export const renderWithProviders = (ui, { preloadedState, route = "/" } = {}) => {
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
