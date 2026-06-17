import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Reset scroll to the top on every route change. Without this, navigating from
// (say) a footer link leaves the user scrolled at the bottom of the new page.
const ScrollToTop = (): null => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
