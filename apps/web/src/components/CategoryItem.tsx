import styled from "styled-components";
import { mobile } from "../smallScreen";
import { Link } from 'react-router-dom'
import type { Category } from "../data";

const Container = styled.div`
  flex: 1;
  margin: 8px;
  height: 70vh;
  position: relative;
  border-radius: 14px;
  overflow: hidden; /* clips the image to the rounded corners */
  cursor: pointer;

  /* gentle zoom on hover for polish */
  img {
    transition: transform 0.4s ease;
  }
  &:hover img {
    transform: scale(1.05);
  }
  ${mobile({ height: "30vh", margin: "6px" })}
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Info = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* dark gradient so the title + button stay legible over any photo */
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.15) 0%,
    rgba(0, 0, 0, 0.45) 100%
  );
`;

const Title = styled.h1`
  color: #fff;
  margin-bottom: 20px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
`;

const Button = styled.span`
  display: inline-block;
  border: none;
  padding: 12px 18px;
  background-color: #fff;
  color: #1a1a1a;
  cursor: pointer;
  font-weight: 600;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  ${Container}:hover & {
    background-color: teal;
    color: #fff;
  }
`;

interface CategoryItemProps {
  item: Category;
}

const CategoryItem = ({ item }: CategoryItemProps) => {
  return (
    <Container>
      <Link to={`/products/${item.cat}`} style={{ textDecoration: "none" }}>
        <Image src={item.img} alt={item.title} />
        <Info>
          <Title>{item.title}</Title>
          <Button>SHOP NOW</Button>
        </Info>
      </Link>
    </Container>
  );
};

export default CategoryItem;
