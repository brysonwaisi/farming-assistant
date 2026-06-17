import { Add, Remove, DeleteOutline } from "@material-ui/icons";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import Welcome from "../components/Welcome";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { mobile } from "../smallScreen";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateQuantity, removeProduct, CartProduct } from "../redux/cartRedux";
import { syncCart } from "../redux/apiCalls";
import CheckoutModal from "../components/CheckoutModal";
import { colors } from "../theme";
import type { RootState, AppDispatch } from "../redux/store";

const Container = styled.div``;

const Wrapper = styled.div`
  padding: 20px;
  ${mobile({ padding: "10px" })}
`;

const Title = styled.h1`
  font-weight: 300;
  text-align: center;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
`;

// `type` is repurposed as a visual variant ("filled"), which collides with the
// intrinsic <button type> attribute. Override that prop to accept any string.
type TopButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> & { type?: string };

const TopButton = styled.button<TopButtonProps>`
  padding: 10px;
  font-weight: 600;
  cursor: pointer;
  border: ${(props) => (props.type as string) === "filled" && "none"};
  background-color: ${(props) =>
    (props.type as string) === "filled" ? "black" : "transparent"};
  color: ${(props) => (props.type as string) === "filled" && "white"};
` as React.FC<TopButtonProps>;

const TopTexts = styled.div`
  ${mobile({ display: "none" })}
`;
const TopText = styled.span`
  text-decoration: underline;
  cursor: pointer;
  margin: 0px 10px;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  ${mobile({ flexDirection: "column" })}
`;

const Info = styled.div`
  flex: 3;
`;

const Product = styled.div`
  display: flex;
  justify-content: space-between;
  ${mobile({ flexDirection: "column" })}
`;

const ProductDetail = styled.div`
  flex: 2;
  display: flex;
`;

const ImageWrap = styled.div`
  width: 200px;
  height: 200px;
  min-width: 200px;
  border-radius: 50%;
  background-color: ${colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Image = styled.img`
  width: 75%;
  height: 75%;
  object-fit: contain;
  mix-blend-mode: multiply;
`;

const Details = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const ProductName = styled.span``;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 40px 20px;
  font-size: 18px;
`;


const ProductColor = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
`;

const ProductSize = styled.span``;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 4px 8px;
  border: 1px solid #d32f2f;
  color: #d32f2f;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  width: fit-content;
`;

const PriceDetail = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ProductAmountContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const ProductAmount = styled.div`
  font-size: 24px;
  margin: 5px;
  ${mobile({ margin: "5px 15px" })}
`;

const ProductPrice = styled.div`
  font-size: 30px;
  font-weight: 200;
  ${mobile({ marginBottom: "20px" })}
`;

const Hr = styled.hr`
  background-color: #eee;
  border: none;
  height: 1px;
`;

const Summary = styled.div`
  flex: 1;
  border: 0.5px solid lightgray;
  border-radius: 10px;
  padding: 20px;
  min-height: 50vh;
  height: fit-content;
`;

const SummaryTitle = styled.h1`
  font-weight: 200;
`;

const SummaryItem = styled.div<{ type?: string }>`
  margin: 30px 0px;
  display: flex;
  justify-content: space-between;
  font-weight: ${(props) => props.type === "total" && "500"};
  font-size: ${(props) => props.type === "total" && "24px"};
`;

const SummaryItemText = styled.span``;

const SummaryItemPrice = styled.span``;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: black;
  color: white;
  font-weight: 600;
  cursor: pointer;
  &:disabled {
    background-color: gray;
    cursor: not-allowed;
  }
`;

const Cart = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const wishlistCount = useSelector(
    (state: RootState) => state.wishlist.products.length
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string>("");

  useEffect(() => {
    if (currentUser?._id) {
      syncCart(currentUser._id, cart.products);
    }
  }, [cart.products, currentUser]);

  const handleQuantity = (product: CartProduct, delta: number) => {
    const nextQty = product.quantity + delta;
    // Decrementing the last unit removes the line from the cart.
    if (nextQty <= 0) {
      dispatch(removeProduct({ _id: product._id, type: product.type }));
      return;
    }
    dispatch(
      updateQuantity({
        _id: product._id,
        type: product.type,
        quantity: nextQty,
      })
    );
  };

  const handleRemove = (product: CartProduct) => {
    dispatch(removeProduct({ _id: product._id, type: product.type }));
  };

  const handleCheckout = () => {
    if (!cart.products.length) return;
    // Guests can build a cart, but checkout needs an account — ask them to sign
    // in and bring them right back to the cart.
    if (!currentUser) {
      navigate("/login?redirect=/cart");
      return;
    }
    setCheckoutError("");
    setShowCheckout(true);
  };

  return (
    <Container>
      <Navbar />
      <Welcome />
      <Wrapper>
        <Title>YOUR BAG</Title>
        <Top>
          <TopButton onClick={() => navigate("/products")}>
            CONTINUE SHOPPING
          </TopButton>
          <TopTexts>
            <TopText onClick={() => navigate("/cart")}>
              Shopping Bag ({cart.quantity})
            </TopText>
            <TopText onClick={() => navigate("/wishlist")}>
              Your Wishlist ({wishlistCount})
            </TopText>
          </TopTexts>
          <TopButton type="filled" onClick={handleCheckout} disabled={cart.products.length === 0}>
            CHECKOUT NOW
          </TopButton>
        </Top>
        <Bottom>
          <Info>
            {cart.products.map((product) => (
              <Product key={`${product._id}-${product.type || ""}`}>
                <ProductDetail>
                  <ImageWrap>
                    <Image
                      src={product.img as string}
                      alt={product.title as string}
                    />
                  </ImageWrap>
                  <Details>
                    <ProductName>
                      <b>Product:</b> {product.title as string}
                    </ProductName>
                    {product.type && (
                      <ProductSize>
                        <b>Type:</b> {product.type}
                      </ProductSize>
                    )}
                    <RemoveButton onClick={() => handleRemove(product)}>
                      <DeleteOutline fontSize="small" /> Remove
                    </RemoveButton>
                  </Details>
                </ProductDetail>
                <PriceDetail>
                  <ProductAmountContainer>
                    <Add
                      role="button"
                      aria-label="Increase quantity"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleQuantity(product, 1)}
                    />
                    <ProductAmount>{product.quantity}</ProductAmount>
                    <Remove
                      role="button"
                      aria-label="Decrease quantity"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleQuantity(product, -1)}
                    />
                  </ProductAmountContainer>
                  <ProductPrice>
                    KES {product.price * product.quantity}
                  </ProductPrice>
                </PriceDetail>
              </Product>
            ))}
            {cart.products.length === 0 && (
              <EmptyState>
                <ProductName>Your cart is empty.</ProductName>
                <TopText onClick={() => navigate("/products")}>
                  Browse all products
                </TopText>
              </EmptyState>
            )}
            <Hr />
          </Info>
          <Summary>
            <SummaryTitle>ORDER SUMMARY</SummaryTitle>
            <SummaryItem>
              <SummaryItemText>Subtotal</SummaryItemText>
              <SummaryItemPrice>KES {cart.total}</SummaryItemPrice>
            </SummaryItem>
            <SummaryItem>
              <SummaryItemText>Estimated Shipping</SummaryItemText>
              <SummaryItemPrice>KES 250</SummaryItemPrice>
            </SummaryItem>
            <SummaryItem>
              <SummaryItemText>Shipping Discount</SummaryItemText>
              <SummaryItemPrice>KES -250</SummaryItemPrice>
            </SummaryItem>
            <SummaryItem type="total">
              <SummaryItemText>Total</SummaryItemText>
              <SummaryItemPrice>KES {cart.total}</SummaryItemPrice>
            </SummaryItem>
            <Button
              onClick={handleCheckout}
              disabled={cart.products.length === 0}
            >
              CHECKOUT NOW
            </Button>
            {checkoutError && (
              <p style={{ color: "#d32f2f", marginTop: 10 }}>{checkoutError}</p>
            )}
          </Summary>
        </Bottom>
      </Wrapper>
      <Footer />
      {showCheckout && (
        <CheckoutModal
          products={cart.products}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </Container>
  );
};

export default Cart;
