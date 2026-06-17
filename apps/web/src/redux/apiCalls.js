import {
  loginFailure,
  loginStart,
  loginSuccess,
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
} from "./userRedux";
import {
  subscriptionStart, subscriptionSuccess, subscriptionFailure
} from "./subscriptionRedux";
import { setCart } from "./cartRedux";
import { setWishlist } from "./wishlistRedux";

import { pubRequest, userRequest } from "../reqMethods";

export const loadCart = async (dispatch, userId) => {
  try {
    const cartRes = await userRequest.get(`/carts/find/${userId}`);
    const serverCart = cartRes.data;
    if (!serverCart || !serverCart.products?.length) {
      dispatch(setCart({ products: [] }));
      return;
    }
    const detailed = await Promise.all(
      serverCart.products.map(async (item) => {
        const prodRes = await pubRequest.get(`/products/find/${item.productId}`);
        return { ...prodRes.data, quantity: item.quantity };
      })
    );
    dispatch(setCart({ products: detailed }));
  } catch (err) {
    /* no cart yet or fetch failed */
  }
};

export const syncCart = async (userId, products) => {
  try {
    const payload = {
      userId,
      products: products.map((p) => ({
        productId: p._id,
        quantity: p.quantity,
      })),
    };
    await userRequest.put(`/carts/find/${userId}`, payload);
  } catch (err) {
    /* best-effort sync */
  }
};

export const loadWishlist = async (dispatch, userId) => {
  try {
    const res = await userRequest.get(`/wishlist/find/${userId}`);
    const server = res.data;
    if (!server || !server.products?.length) {
      dispatch(setWishlist({ products: [] }));
      return;
    }
    const detailed = await Promise.all(
      server.products.map(async (item) => {
        const prodRes = await pubRequest.get(`/products/find/${item.productId}`);
        return prodRes.data;
      })
    );
    dispatch(setWishlist({ products: detailed.filter(Boolean) }));
  } catch (err) {
    /* no wishlist yet or fetch failed */
  }
};

export const syncWishlist = async (userId, products) => {
  try {
    const payload = { products: products.map((p) => ({ productId: p._id })) };
    await userRequest.put(`/wishlist/find/${userId}`, payload);
  } catch (err) {
    /* best-effort sync */
  }
};

export const login = (user) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const res = await pubRequest.post("/auth/login", user);
    dispatch(loginSuccess(res.data));
    await loadCart(dispatch, res.data._id);
    await loadWishlist(dispatch, res.data._id);
  } catch (err) {
    dispatch(loginFailure());
  }
};

// Update the current user's own profile; returns { ok, message }.
export const updateProfile = async (dispatch, userId, changes) => {
  try {
    const res = await userRequest.put(`/users/${userId}`, changes);
    dispatch(updateUser(res.data));
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: err.response?.data?.message || "Could not update your profile.",
    };
  }
};

// Upload an avatar: presign -> PUT to S3 -> save the CloudFront URL on the user.
// Returns { ok, message }.
export const uploadAvatar = async (dispatch, userId, file) => {
  try {
    const { data } = await userRequest.post("/users/avatar-upload-url", {
      contentType: file.type,
    });
    await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    return updateProfile(dispatch, userId, { image: data.fileUrl });
  } catch (err) {
    return {
      ok: false,
      message: err.response?.data?.message || "Could not upload image.",
    };
  }
};

// Reconcile client state to the httpOnly cookie on app load.
export const checkAuth = async (dispatch) => {
  try {
    const res = await userRequest.get("/auth/check-auth");
    if (res.data?.user) {
      dispatch(loginSuccess(res.data.user));
      await loadCart(dispatch, res.data.user._id);
      await loadWishlist(dispatch, res.data.user._id);
    }
  } catch (err) {
    if (err.response?.status === 401) {
      dispatch(logout());
    }
  }
};

export const signup = (user) => async (dispatch) => {
  dispatch(signupStart());
  try {
    const res = await pubRequest.post("/auth/register", user);
    dispatch(signupSuccess(res.data));
  } catch (err) {
    dispatch(signupFailure());
  }
};
export const forgotpassword = (user) => async (dispatch) => {
  dispatch(forgotpasswordStart());
  try {
    const res = await pubRequest.post("/auth/forgot-password", user);
    dispatch(forgotpasswordSuccess(res.data));
  } catch (err) {
    dispatch(forgotpasswordFailure());
  }
};

export const resetpassword = (user) => async (dispatch) => {
  dispatch(resetpasswordStart());
  try {
    const res = await pubRequest.post(`/auth/reset-password/${user.token}`, {
      password: user.password,
    });
    dispatch(resetpasswordSuccess(res.data));
  } catch (err) {
    dispatch(resetpasswordFailure());
  }
};
export const subscriptions = (email) => async (dispatch) => {
  dispatch(subscriptionStart());
  try{
    const res = await pubRequest.post("/subscribe", email);
    dispatch(subscriptionSuccess(res.data));
  } catch(err) {
    dispatch(subscriptionFailure())
  }
}