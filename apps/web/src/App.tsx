import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { checkAuth } from "./redux/apiCalls";
import type { RootState, AppDispatch } from "./redux/store";
import ScrollToTop from "./components/ScrollToTop";

const Home = lazy(() => import("./pages/Home"));
const Product = lazy(() => import("./pages/Product"));
const ProductList = lazy(() => import("./pages/ProductList"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Logout = lazy(() => import("./pages/Logout"));
const Cart = lazy(() => import("./pages/Cart"));
const Success = lazy(() => import("./pages/Success"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Search = lazy(() => import("./pages/Search"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Account = lazy(() => import("./pages/Account"));

function App() {
  const user = useSelector((state: RootState) => state.user.isLoggedIn);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    checkAuth(dispatch);
  }, [dispatch]);

  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:category" element={<ProductList />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/search" element={<Search />} />
        <Route path="/success" element={<Success />} />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <Register />}
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/forgot-password"
          element={user ? <Navigate to="/" /> : <ForgotPassword />}
        />
        <Route
          path="/reset-password/:token"
          element={user ? <Navigate to="/" /> : <ResetPassword />}
        />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/wishlist"
          element={!user ? <Navigate to="/login" /> : <Wishlist />}
        />
        <Route
          path="/account"
          element={!user ? <Navigate to="/login?redirect=/account" /> : <Account />}
        />
        <Route
          path="/logout"
          element={!user ? <Navigate to="/login" /> : <Logout />}
        />
      </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
