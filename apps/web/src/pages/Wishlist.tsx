import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Welcome from "../components/Welcome";
import Footer from "../components/Footer";
import Button from "../components/Button";
import { mobile } from "../smallScreen";
import { colors } from "../theme";
import { removeFromWishlist } from "../redux/wishlistRedux";
import { addProduct } from "../redux/cartRedux";
import { syncWishlist } from "../redux/apiCalls";
import type { RootState, AppDispatch } from "../redux/store";
import type { WishlistProduct } from "../redux/wishlistRedux";

// Wishlist items carry display/server fields alongside `_id` via the slice's
// index signature; narrow the ones this page reads for rendering and cart move.
interface WishlistDisplayProduct extends WishlistProduct {
  img?: string;
  title?: string;
  price?: number;
  type?: string | string[];
}

interface SmallBtnProps {
  variant?: "danger";
}

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

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 0 20px 40px;
`;

const Card = styled.div`
  flex: 1 1 240px;
  max-width: 280px;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const ImageWrap = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background-color: ${colors.lightBg};
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

const Name = styled.span`
  font-weight: 600;
`;

const Price = styled.span`
  color: ${colors.muted};
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

const SmallBtn = styled.button<SmallBtnProps>`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  border: ${(props) =>
    props.variant === "danger" ? "1px solid #d32f2f" : "none"};
  background-color: ${(props) =>
    props.variant === "danger" ? "white" : colors.primary};
  color: ${(props) => (props.variant === "danger" ? "#d32f2f" : "white")};
  &:hover {
    opacity: 0.9;
  }
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 20px;
  font-size: 18px;
`;

const Wishlist = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const products = useSelector(
    (state: RootState) => state.wishlist.products
  ) as WishlistDisplayProduct[];
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  useEffect(() => {
    if (currentUser?._id) {
      syncWishlist(currentUser._id, products);
    }
  }, [products, currentUser]);

  const handleRemove = (id: string) => dispatch(removeFromWishlist(id));

  const handleMoveToCart = (product: WishlistDisplayProduct) => {
    dispatch(
      addProduct({
        ...product,
        quantity: 1,
        type: Array.isArray(product.type)
          ? product.type[0] || ""
          : product.type || "",
      })
    );
    dispatch(removeFromWishlist(product._id));
  };

  return (
    <Container>
      <Navbar />
      <Welcome />
      <Wrapper>
        <Title>YOUR WISHLIST</Title>
        <Top>
          <Button variant="outline" onClick={() => navigate("/products")}>
            CONTINUE SHOPPING
          </Button>
          <span>{products.length} item(s)</span>
        </Top>

        {products.length === 0 ? (
          <Empty>
            <span>Your wishlist is empty.</span>
            <Button onClick={() => navigate("/products")}>
              Browse all products
            </Button>
          </Empty>
        ) : (
          <Grid>
            {products.map((product) => (
              <Card key={product._id}>
                <ImageWrap>
                  <Image src={product.img} alt={product.title} />
                </ImageWrap>
                <Name>{product.title}</Name>
                <Price>KES {product.price}</Price>
                <Actions>
                  <SmallBtn onClick={() => handleMoveToCart(product)}>
                    Move to cart
                  </SmallBtn>
                  <SmallBtn
                    variant="danger"
                    onClick={() => handleRemove(product._id)}
                  >
                    Remove
                  </SmallBtn>
                </Actions>
              </Card>
            ))}
          </Grid>
        )}
      </Wrapper>
      <Footer />
    </Container>
  );
};

export default Wishlist;
