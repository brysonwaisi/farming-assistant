import { Add, Remove, Favorite, FavoriteBorderOutlined } from "@material-ui/icons";
import styled from "styled-components";
import Welcome from "../components/Welcome";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Newsletter from "../components/Newsletter";
import { mobile } from "../smallScreen";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { pubRequest } from "../reqMethods";
import { useDispatch, useSelector } from "react-redux";
import { addProduct, updateQuantity } from "../redux/cartRedux";
import { useWishlistToggle } from "../hooks/useWishlistToggle";
import { FALLBACK_IMG, onImgError } from "../constants/images";
import { colors } from "../theme";
import type { RootState, AppDispatch } from "../redux/store";

// Product shape returned by `/products/find/:id`. `type` arrives as a string[]
// (the available variants), which is normalized to a string when added to cart.
interface ProductData {
  _id: string;
  title?: string;
  desc?: string;
  img?: string;
  price?: number;
  type?: string[];
  [key: string]: unknown;
}

const Container = styled.div``;

const Wrapper = styled.div`
  padding: 50px;
  display: flex;
  ${mobile({ padding: "10px", flexDirection: "column" })}
`;

const ImgContainer = styled.div`
  flex: 1;
  background-color: ${colors.lightBg};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Image = styled.img`
  width: 100%;
  height: 70vh;
  object-fit: contain;
  mix-blend-mode: multiply;
  border-radius: 8px;
  ${mobile({ height: "40vh" })}
`;

const InfoContainer = styled.div`
  flex: 1;
  padding: 0px 50px;
  ${mobile({ padding: "10px" })}
`;

const Title = styled.h1`
  font-weight: 200;
`;

const Desc = styled.p`
  margin: 20px 0px;
`;

const Price = styled.span`
  font-weight: 100;
  font-size: 40px;
`;

const FilterContainer = styled.div`
  width: 50%;
  margin: 30px 0px;
  display: flex;
  justify-content: space-between;
  ${mobile({ width: "100%" })}
`;

const Filter = styled.div`
  display: flex;
  align-items: center;
`;

const FilterTitle = styled.span`
  font-size: 20px;
  font-weight: 200;
`;

const FilterColor = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  margin: 0px 5px;
  cursor: pointer;
`;

const FilterType = styled.select`
  margin-left: 10px;
  padding: 5px;
`;

const FilterTypeOption = styled.option``;

const AddContainer = styled.div`
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${mobile({ width: "100%" })}
`;

const AmountContainer = styled.div`
  display: flex;
  align-items: center;
  font-weight: 700;
`;

const Amount = styled.span`
  width: 30px;
  height: 30px;
  border-radius: 10px;
  border: 1px solid teal;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0px 5px;
`;

const Button = styled.button`
  padding: 15px;
  border: 2px solid teal;
  background-color: white;
  cursor: pointer;
  font-weight: 500;
  border-radius: 8px;
  &:hover:not(:disabled) {
    background-color: #f8f4f4;
  }
  &:disabled {
    border-color: gray;
    color: gray;
    cursor: not-allowed;
  }
`;

const WishlistButton = styled.button`
  margin-left: 12px;
  padding: 12px;
  border: 2px solid #d32f2f;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  &:hover {
    background-color: #fff5f5;
  }
`;

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [type, setType] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();

  const cartProducts = useSelector((state: RootState) => state.cart.products);
  const { toggle, isWished } = useWishlistToggle();
  // Is this exact product+type already in the cart?
  const inCart = product
    ? cartProducts.find((p) => p._id === product._id && p.type === type)
    : null;
  const wished = product ? isWished(product._id) : false;

  useEffect(() => {
    let active = true;
    const getProduct = async () => {
      setLoading(true);
      try {
        const res = await pubRequest.get<ProductData>(`/products/find/${id}`);
        if (!active) return;
        setProduct(res.data);
        if (res.data?.type?.length) {
          setType(res.data.type[0] ?? "");
        }
      } catch (error) {
        if (active) setProduct(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    getProduct();
    return () => {
      active = false;
    };
  }, [id]);

  // Quantity shown reflects the cart when the item is already there.
  const displayQuantity = inCart ? inCart.quantity : quantity;

  const handleQuantity = (direction: "inc" | "dec") => {
    const next = direction === "dec" ? displayQuantity - 1 : displayQuantity + 1;
    if (inCart && product) {
      // Already in cart -> mutate cart state directly (and remove at 0).
      dispatch(updateQuantity({ _id: product._id, type, quantity: Math.max(1, next) }));
    } else {
      setQuantity(Math.max(1, next));
    }
  };

  const handleClick = () => {
    if (!product) return;
    if (inCart) return; // already added; +/- now controls it
    dispatch(addProduct({ ...product, quantity, type }));
  };

  const handleWishlist = () => toggle(product);

  return (
    <Container>
      <Navbar />
      <Welcome />
      {loading && <Wrapper>Loading product...</Wrapper>}
      {!loading && !product && <Wrapper>Product not found.</Wrapper>}
      {!loading && product && (
        <Wrapper>
          <ImgContainer>
            <Image
              src={product.img || FALLBACK_IMG}
              alt={product.title}
              onError={onImgError}
            />
          </ImgContainer>
          <InfoContainer>
            <Title>{product.title}</Title>
            <Desc>{product.desc}</Desc>
            <Price>KES {product.price}</Price>
            {product.type && product.type.length > 0 && (
              <FilterContainer>
                <Filter>
                  <FilterTitle>Type</FilterTitle>
                  <FilterType
                    value={type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setType(e.target.value)
                    }
                  >
                    {product.type.map((t) => (
                      <FilterTypeOption key={t} value={t}>
                        {t}
                      </FilterTypeOption>
                    ))}
                  </FilterType>
                </Filter>
              </FilterContainer>
            )}
            <AddContainer>
              <AmountContainer>
                <Remove
                  style={{ cursor: "pointer" }}
                  onClick={() => handleQuantity("dec")}
                />
                <Amount>{displayQuantity}</Amount>
                <Add
                  style={{ cursor: "pointer" }}
                  onClick={() => handleQuantity("inc")}
                />
              </AmountContainer>
              <Button onClick={handleClick} disabled={!!inCart}>
                {inCart ? "IN CART" : "ADD TO CART"}
              </Button>
              <WishlistButton onClick={handleWishlist} title="Wishlist">
                {wished ? (
                  <Favorite style={{ color: "#d32f2f" }} />
                ) : (
                  <FavoriteBorderOutlined />
                )}
              </WishlistButton>
            </AddContainer>
          </InfoContainer>
        </Wrapper>
      )}
      <Newsletter />
      <Footer />
    </Container>
  );
};

export default Product;
