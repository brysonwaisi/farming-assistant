import styled from "styled-components";
import Navbar from "../components/Navbar";
import Welcome from "../components/Welcome";
import Products from "../components/Products";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { mobile } from "../smallScreen";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { pubRequest } from "../reqMethods";
import { ProductItem } from "../components/Product";

const Container = styled.div``;

const Title = styled.h1`
  margin: 20px;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Filter = styled.div`
  margin: 20px;
  ${mobile({ margin: "10px 20px", display: "flex", flexDirection: "column" })}
`;

const FilterText = styled.span`
  font-size: 20px;
  font-weight: 600;
  margin-right: 20px;
  ${mobile({ marginRight: "0px" })}
`;

const Select = styled.select`
  padding: 10px;
  margin-right: 20px;
  ${mobile({ margin: "10px 0px" })}
`;
const Option = styled.option``;

type SortOrder = "newest" | "asc" | "desc";

type FilterState = Record<string, string>;

const ProductList = () => {
  const { category: cat } = useParams<{ category: string }>();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<FilterState>({});
  const [sort, setSort] = useState<SortOrder>("newest");

  useEffect(() => {
    let active = true;
    const getProducts = async () => {
      setLoading(true);
      setFilter({});
      try {
        const res = await pubRequest.get<ProductItem[]>(
          cat ? `products?category=${cat}` : "products"
        );
        if (active) setProducts(res.data);
      } catch (err) {
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    getProducts();
    return () => {
      active = false;
    };
  }, [cat]);

  // Build the type dropdown from the values that actually exist in this category.
  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const types = Array.isArray(p.type) ? p.type : p.type ? [p.type] : [];
      types.forEach((t) => t && set.add(t));
    });
    return [...set].sort();
  }, [products]);

  const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter((prev) => {
      const next = { ...prev };
      if (value === "all") {
        delete next[name];
      } else {
        next[name] = value;
      }
      return next;
    });
  };

  return (
    <Container>
      <Navbar />
      <Welcome />
      <Title>{cat || "All Products"}</Title>
      <FilterContainer>
        <Filter>
          <FilterText>Filter Products:</FilterText>
          <Select name="type" aria-label="Filter by type" value={filter.type || "all"} onChange={handleFilter}>
            <Option value="all">All types</Option>
            {typeOptions.map((t) => (
              <Option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Option>
            ))}
          </Select>
        </Filter>
        <Filter>
          <FilterText>Sort Products:</FilterText>
          <Select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value as SortOrder)}>
            <Option value="newest">Newest</Option>
            <Option value="asc">Price (asc)</Option>
            <Option value="desc">Price (desc)</Option>
          </Select>
        </Filter>
      </FilterContainer>
      <Products products={products} loading={loading} filter={filter} sort={sort} />
      <Newsletter />
      <Footer />
    </Container>
  );
};

export default ProductList;
