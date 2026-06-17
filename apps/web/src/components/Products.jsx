import styled from "styled-components";
import Product from "./Product";
import { useState, useEffect, useMemo } from "react";
import { pubRequest } from "../reqMethods";
import Button from "./Button";

const PAGE_SIZE = 8;

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 10px;
`;

const Message = styled.p`
  margin: 20px;
  font-size: 18px;
`;

const LoadMoreRow = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px 0 30px;
`;

const Products = ({ products: productsProp, loading: loadingProp, filter = {}, sort = "newest" }) => {
  // Two modes: controlled (ProductList passes products) or self-fetching (Home).
  const controlled = productsProp !== undefined;
  const [fetched, setFetched] = useState([]);
  const [fetching, setFetching] = useState(!controlled);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (controlled) return undefined;
    let active = true;
    const getProducts = async () => {
      setFetching(true);
      try {
        const res = await pubRequest.get("products");
        if (active) setFetched(res.data);
      } catch (err) {
        if (active) setFetched([]);
      } finally {
        if (active) setFetching(false);
      }
    };
    getProducts();
    return () => {
      active = false;
    };
  }, [controlled]);

  const products = controlled ? productsProp : fetched;
  const loading = controlled ? loadingProp : fetching;

  const sortedMatched = useMemo(() => {
    const eq = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
    const matched = products.filter((item) =>
      Object.entries(filter).every(([key, value]) => {
        if (Array.isArray(item[key])) {
          return item[key].some((v) => eq(v, value));
        }
        return eq(item[key], value);
      })
    );

    const sorted = [...matched];
    if (sort === "asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sort === "desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }
    return sorted;
  }, [products, filter, sort]);

  // Reset paging whenever the result set changes.
  useEffect(() => {
    setPage(1);
  }, [filter, sort, products]);

  // Home (uncontrolled) shows a fixed teaser of 8; catalog pages paginate.
  const visible = controlled
    ? sortedMatched.slice(0, page * PAGE_SIZE)
    : sortedMatched.slice(0, 8);

  const hasMore = controlled && visible.length < sortedMatched.length;

  return (
    <>
      {!loading && sortedMatched.length === 0 && (
        <Message>No products found.</Message>
      )}
      <Container>
        {visible.map((item) => (
          <Product item={item} key={item._id} />
        ))}
      </Container>
      {hasMore && (
        <LoadMoreRow>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
            Load more ({sortedMatched.length - visible.length} more)
          </Button>
        </LoadMoreRow>
      )}
    </>
  );
};

export default Products;
