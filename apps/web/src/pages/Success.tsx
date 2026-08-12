import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userRequest } from "../reqMethods";
import { clearCart } from "../redux/cartRedux";
import Button from "../components/Button";
import type { RootState, AppDispatch } from "../redux/store";

type Status = "processing" | "created" | "error";

interface CheckoutSession {
  paymentStatus: string;
}

interface OrderResponse {
  _id: string;
}

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const cart = useSelector((state: RootState) => state.cart);

  const [status, setStatus] = useState<Status>("processing"); // processing | created | error
  const [orderId, setOrderId] = useState<string | null>(null);
  const created = useRef(false); // guard against double-create in StrictMode

  useEffect(() => {
    const finalize = async () => {
      if (created.current) return;
      created.current = true;

      try {
        if (sessionId) {
          const session = await userRequest.get<CheckoutSession>(
            `/checkout/session/${sessionId}`
          );
          if (session.data.paymentStatus !== "paid") {
            setStatus("error");
            return;
          }
        }

        const res = await userRequest.post<OrderResponse>("/orders", {
          userId: currentUser?._id,
          products: cart.products.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
          })),
          amount: cart.total,
          address: {},
        });
        setOrderId(res.data._id);
        setStatus("created");
        dispatch(clearCart());
      } catch (err) {
        setStatus("error");
      }
    };

    if (currentUser && cart.products.length) {
      finalize();
    } else if (!cart.products.length) {
      setStatus("created");
    }
  }, [sessionId, currentUser, cart, dispatch]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {status === "created" &&
        (orderId
          ? `Order created successfully. Your order number is ${orderId}`
          : "Payment successful. Your order is being prepared...")}
      {status === "processing" && "Finalizing your order..."}
      {status === "error" && "We couldn't confirm your payment. Please contact support."}
      <Button style={{ marginTop: 20 }} onClick={() => navigate("/")}>
        Go to Homepage
      </Button>
    </div>
  );
};

export default Success;
