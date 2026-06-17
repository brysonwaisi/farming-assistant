import {
  Favorite,
  FavoriteBorderOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@material-ui/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import styled, { css } from "styled-components";
import { addProduct } from "../redux/cartRedux";
import { useWishlistToggle } from "../hooks/useWishlistToggle";
import { FALLBACK_IMG, onImgError } from "../constants/images";
import { colors } from "../theme";
import { mobile, tablet } from "../smallScreen";


const Info = styled.div`
  opacity: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.15);
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease;
  cursor: pointer;
`;

const Container = styled.div`
  flex: 1 1 22%;
  margin: 5px;
  min-width: 250px;
  max-width: 24%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors.lightBg};
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;

  &:hover ${Info} {
    opacity: 1;
  }

  ${tablet(css`
    flex: 1 1 30%;
    max-width: 31%;
  `)}
  ${mobile(css`
    flex: 1 1 45%;
    min-width: 45%;
    max-width: 47%;
  `)}
`;

const Circle = styled.div`
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background-color: ${colors.white};
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Image = styled.img`
  width: 75%;
  height: 75%;
  object-fit: contain;
  z-index: 2;
  mix-blend-mode: multiply;
`;

const Icon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px;
  cursor: pointer;
  transition: all 0.5s ease;

  &:hover {
    background-color: #e9f5f5;
    transform: scale(1.1);
  }
`;

const Product = ({ item }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toggle, isWished } = useWishlistToggle();
  const wished = isWished(item?._id);

  if (!item) {
    return <div>No item available</div>;
  }

  const openProduct = () => navigate(`/product/${item._id}`);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(
      addProduct({ ...item, quantity: 1, type: item.type?.[0] || "" })
    );
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggle(item);
  };

  return (
    <Container onClick={openProduct}>
      <Circle>
        <Image
          src={item.img || FALLBACK_IMG}
          alt={item.title}
          onError={onImgError}
        />
      </Circle>
      <Info>
        <Icon onClick={handleAddToCart} title="Add to cart">
          <ShoppingCartOutlined />
        </Icon>
        <Icon
          onClick={(e) => {
            e.stopPropagation();
            openProduct();
          }}
          title="View product"
        >
          <SearchOutlined />
        </Icon>
        <Icon
          onClick={handleWishlist}
          title={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wished ? (
            <Favorite style={{ color: "#d32f2f" }} />
          ) : (
            <FavoriteBorderOutlined />
          )}
        </Icon>
      </Info>
    </Container>
  );
};

export default Product;
