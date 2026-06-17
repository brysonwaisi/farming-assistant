import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist, WishlistProduct } from "../redux/wishlistRedux";
import { syncWishlist } from "../redux/apiCalls";
import type { RootState } from "../redux/store";

export const useWishlistToggle = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const wishlist = useSelector((state: RootState) => state.wishlist.products);

  const isWished = (id: string) => wishlist.some((p) => p._id === id);

  const toggle = (item: WishlistProduct | null | undefined) => {
    if (!item) return;
    const wished = isWished(item._id);
    dispatch(toggleWishlist(item));
    if (currentUser?._id) {
      const next = wished
        ? wishlist.filter((p) => p._id !== item._id)
        : [...wishlist, item];
      syncWishlist(currentUser._id, next);
    }
  };

  return { toggle, isWished };
};
