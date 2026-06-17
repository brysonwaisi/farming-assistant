import { AxiosError } from "axios";
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
  User,
} from "./userRedux";
import {
  subscriptionStart, subscriptionSuccess, subscriptionFailure
} from "./subscriptionRedux";
import { setCart, CartProduct } from "./cartRedux";
import { setWishlist, WishlistProduct } from "./wishlistRedux";

import { pubRequest, userRequest } from "../reqMethods";
import type { AppDispatch } from "./store";

// Server cart/wishlist documents reference products by id + quantity.
interface CartLineItem {
  productId: string;
  quantity: number;
}

interface ServerCart {
  products?: CartLineItem[];
}

interface WishlistLineItem {
  productId: string;
}

interface ServerWishlist {
  products?: WishlistLineItem[];
}

// Shape returned by the avatar presign endpoint.
interface AvatarUploadUrl {
  uploadUrl: string;
  fileUrl: string;
}

// Standard mutation result for profile/avatar flows.
interface MutationResult {
  ok: boolean;
  message?: string;
}

// Error body shape returned by the API on failure.
interface ApiErrorData {
  message?: string;
}

export const loadCart = async (
  dispatch: AppDispatch,
  userId: string
): Promise<void> => {
  try {
    const cartRes = await userRequest.get<ServerCart>(`/carts/find/${userId}`);
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

export const syncCart = async (
  userId: string,
  products: CartProduct[]
): Promise<void> => {
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

export const loadWishlist = async (
  dispatch: AppDispatch,
  userId: string
): Promise<void> => {
  try {
    const res = await userRequest.get<ServerWishlist>(`/wishlist/find/${userId}`);
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

export const syncWishlist = async (
  userId: string,
  products: WishlistProduct[]
): Promise<void> => {
  try {
    const payload = { products: products.map((p) => ({ productId: p._id })) };
    await userRequest.put(`/wishlist/find/${userId}`, payload);
  } catch (err) {
    /* best-effort sync */
  }
};

export const login = (user: unknown) => async (dispatch: AppDispatch) => {
  dispatch(loginStart());
  try {
    const res = await pubRequest.post<User>("/auth/login", user);
    dispatch(loginSuccess(res.data));
    await loadCart(dispatch, res.data._id);
    await loadWishlist(dispatch, res.data._id);
  } catch (err) {
    dispatch(loginFailure());
  }
};

// Update the current user's own profile; returns { ok, message }.
export const updateProfile = async (
  dispatch: AppDispatch,
  userId: string,
  changes: Partial<User>
): Promise<MutationResult> => {
  try {
    const res = await userRequest.put<Partial<User>>(`/users/${userId}`, changes);
    dispatch(updateUser(res.data));
    return { ok: true };
  } catch (err) {
    const axiosErr = err as AxiosError<ApiErrorData>;
    return {
      ok: false,
      message: axiosErr.response?.data?.message || "Could not update your profile.",
    };
  }
};

// Upload an avatar: presign -> PUT to S3 -> save the CloudFront URL on the user.
// Returns { ok, message }.
export const uploadAvatar = async (
  dispatch: AppDispatch,
  userId: string,
  file: File
): Promise<MutationResult> => {
  try {
    const { data } = await userRequest.post<AvatarUploadUrl>("/users/avatar-upload-url", {
      contentType: file.type,
    });
    await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    return updateProfile(dispatch, userId, { image: data.fileUrl });
  } catch (err) {
    const axiosErr = err as AxiosError<ApiErrorData>;
    return {
      ok: false,
      message: axiosErr.response?.data?.message || "Could not upload image.",
    };
  }
};

// Reconcile client state to the httpOnly cookie on app load.
export const checkAuth = async (dispatch: AppDispatch): Promise<void> => {
  try {
    const res = await userRequest.get<{ user?: User }>("/auth/check-auth");
    if (res.data?.user) {
      dispatch(loginSuccess(res.data.user));
      await loadCart(dispatch, res.data.user._id);
      await loadWishlist(dispatch, res.data.user._id);
    }
  } catch (err) {
    const axiosErr = err as AxiosError;
    if (axiosErr.response?.status === 401) {
      dispatch(logout());
    }
  }
};

export const signup = (user: unknown) => async (dispatch: AppDispatch) => {
  dispatch(signupStart());
  try {
    const res = await pubRequest.post<User>("/auth/register", user);
    dispatch(signupSuccess(res.data));
  } catch (err) {
    dispatch(signupFailure());
  }
};
export const forgotpassword = (user: unknown) => async (dispatch: AppDispatch) => {
  dispatch(forgotpasswordStart());
  try {
    const res = await pubRequest.post("/auth/forgot-password", user);
    dispatch(forgotpasswordSuccess(res.data));
  } catch (err) {
    dispatch(forgotpasswordFailure());
  }
};

interface ResetPasswordInput {
  token: string;
  password: string;
}

export const resetpassword = (user: ResetPasswordInput) => async (dispatch: AppDispatch) => {
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
export const subscriptions = (email: { email: string }) => async (dispatch: AppDispatch) => {
  dispatch(subscriptionStart());
  try{
    await pubRequest.post("/subscribe", email);
    dispatch(subscriptionSuccess());
  } catch(err) {
    dispatch(subscriptionFailure())
  }
}
