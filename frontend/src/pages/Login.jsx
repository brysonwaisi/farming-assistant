import styled from "styled-components";
import { mobile, tablet } from "../smallScreen";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/apiCalls";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import backgroundImage from "../assets/home.svg";

const Container = styled(motion.div)`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0.2)
    ),
    url(${backgroundImage}) center;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Wrapper = styled.div`
  width: 25%;
  padding: 20px;
  border-radius: 20px;
  background-color: beige;
  ${tablet({ width: "55%" })}
  ${mobile({ width: "85%" })}
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 300;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  flex: 1;
  min-width: 40%;
  margin: 10px 0;
  padding: 10px;
  border-radius: 6px;
  font-size: 24px;
`;

const Button = styled.button`
  width: 60%;
  border: none;
  padding: 15px 20px;
  background-color: teal;
  color: white;
  cursor: pointer;
  margin-bottom: 10px;
  font-size: 18px;
  &:disabled {
    color: green;
    cursor: not-allowed;
  }
  border-radius: 10px;
`;

const Error = styled.span`
  color: red;
`;

const LinkRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
`;

const StyledLink = styled(Link)`
  font-size: 15px;
  color: teal;
  text-decoration: none;
  font-weight: 500;
  width: fit-content;
  &:hover {
    text-decoration: underline;
    color: #00695c;
  }
`;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isFetching, error, isLoggedIn } = useSelector((state) => state.user);

  // After a successful login, go where the user was headed (e.g. /cart). Only
  // honor internal absolute paths ("/cart") — never an external URL or
  // protocol-relative ("//evil.com") — to avoid an open-redirect.
  useEffect(() => {
    if (isLoggedIn) {
      const requested = searchParams.get("redirect") || "/";
      const safe = /^\/(?!\/)/.test(requested) ? requested : "/";
      navigate(safe);
    }
  }, [isLoggedIn, navigate, searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ username, password }));
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Wrapper>
        <Title>SIGN IN</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            name="username"
            autoComplete="username"
            placeholder="username"
            aria-label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="password"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" disabled={isFetching}>
            LOGIN
          </Button>
          {error && <Error>Check your details again...</Error>}
          <LinkRow>
            <StyledLink to="/forgot-password">Forgot password?</StyledLink>
            <StyledLink to="/register">Create a new account</StyledLink>
          </LinkRow>
        </Form>
      </Wrapper>
    </Container>
  );
};

export default Login;
