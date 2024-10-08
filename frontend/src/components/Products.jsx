import styled from "styled-components";
import Product from "./Product";
import { useState, useEffect } from "react";
import { userRequest } from "../reqMethods";

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const Products = ({ cat, filter, sort }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const res = await userRequest.get(
          cat
            ? `products?category=${cat}`
            : "products"
        );

        setProducts(res.data);
      } catch (err) {
        setProducts([]);
      }
    };
    getProducts();
  }, [cat]);

  useEffect(() => {
    cat &&
      setFilteredProducts(
        products.filter((item) =>
          Object.entries(filter).every(([key, value]) => {
            if (Array.isArray(item[key])) {
              return item[key].includes(value);
            } else {
              return item[key] === value;
            }
          })
        )
      );
  }, [products, cat, filter]);

  useEffect(() => {
    if (sort === "newest") {
      setFilteredProducts((prev) =>
        [...prev].sort((a, b) => a.createdAt - b.createdAt)
      );
    } else if (sort === "asc") {
      setFilteredProducts((prev) => [
        ...prev.sort((a, b) => a.price - b.price),
      ]);
    } else {
      setFilteredProducts((prev) => [
        ...prev.sort((a, b) => b.price - a.price),
      ]);
    }
  }, [sort]);

  return (
    <Container>
      {cat
        ? filteredProducts.map((item) => <Product item={item} key={item._id} />)
        : products
            .slice(0, 8)
            .map((item) => <Product item={item} key={item._id} />)}
    </Container>
  );
};

export default Products;
