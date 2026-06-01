import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist } from "../redux/wishlistRedux";
import { syncWishlist } from "../redux/apiCalls";

export const useWishlistToggle = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const wishlist = useSelector((state) => state.wishlist.products);

  const isWished = (id) => wishlist.some((p) => p._id === id);

  const toggle = (item) => {
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
