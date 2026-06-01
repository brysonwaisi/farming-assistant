import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Welcome from "../components/Welcome";
import Footer from "../components/Footer";
import Product from "../components/Product";
import { useFetch } from "../hooks/useFetch";

const Container = styled.div``;

const Title = styled.h1`
  margin: 20px;
  font-weight: 300;
`;

const Grid = styled.div`
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const Message = styled.p`
  margin: 20px;
  font-size: 18px;
`;

const Search = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const { data: results, loading } = useFetch(
    q ? `/products?search=${encodeURIComponent(q)}` : null
  );

  return (
    <Container>
      <Navbar />
      <Welcome />
      <Title>
        {q ? `Search results for "${q}"` : "Search products"}
      </Title>
      {loading && <Message>Searching...</Message>}
      {!loading && q && results.length === 0 && (
        <Message>No products matched "{q}".</Message>
      )}
      {!loading && !q && <Message>Type something in the search bar above.</Message>}
      <Grid>
        {results.map((item) => (
          <Product item={item} key={item._id} />
        ))}
      </Grid>
      <Footer />
    </Container>
  );
};

export default Search;
