import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { userRequest } from "../reqMethods";
import { CartProduct } from "../redux/cartRedux";

const KEY = import.meta.env.VITE_PUBLISHABLE_KEY;
const stripePromise = KEY ? loadStripe(KEY) : null;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 10px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow: auto;
  position: relative;
  padding: 16px;
`;

const Close = styled.button`
  position: absolute;
  top: 10px;
  right: 12px;
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #555;
  z-index: 1;
`;

const ErrorBox = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: #d32f2f;
`;

interface CreateSessionResponse {
  clientSecret: string;
}

interface CheckoutModalProps {
  products: CartProduct[];
  onClose: () => void;
}

const CheckoutModal = ({ products, onClose }: CheckoutModalProps) => {
  // Pre-fetch the session so we can show a clear error instead of a blank modal
  // if Stripe rejects (e.g. unconfigured account, auth/network failure).
  const [error, setError] = useState<boolean>(false);

  const fetchClientSecret = useCallback(async () => {
    const res = await userRequest.post<CreateSessionResponse>(
      "/checkout/create-embedded-session",
      {
        products,
      }
    );
    return res.data.clientSecret;
  }, [products]);

  useEffect(() => {
    let active = true;
    fetchClientSecret().catch(() => {
      if (active) setError(true);
    });
    return () => {
      active = false;
    };
  }, [fetchClientSecret]);

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <Close onClick={onClose} aria-label="Close checkout">
          ×
        </Close>
        {error ? (
          <ErrorBox>
            Sorry, we couldn&apos;t start checkout right now. Please try again later.
          </ErrorBox>
        ) : (
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ fetchClientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        )}
      </Modal>
    </Overlay>
  );
};

export default CheckoutModal;
