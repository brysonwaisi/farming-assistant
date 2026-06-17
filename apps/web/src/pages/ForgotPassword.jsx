import styled from "styled-components";
import { mobile, tablet } from "../smallScreen";
import { useDispatch, useSelector } from "react-redux";
import { forgotpassword } from "../redux/apiCalls";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import backgroundImage from "../assets/home.svg";

const StyledLink = styled(Link)`
  margin-top: 14px;
  font-size: 15px;
  color: teal;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
    color: #00695c;
  }
`;

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

const Message = styled.div`
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  margin-top: 10px;

  ${(props) =>
    props.type === "error" &&
    `
    background-color: #ffe6e6;
    color: #d32f2f;
  `}

  ${(props) =>
    props.type === "success" &&
    `
    background-color: #e6ffe6;
    color: #2e7d32;
  `}
`;

const Description = styled.p`
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const dispatch = useDispatch();
  const { isFetching, error } = useSelector((state) => state.user);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    setHasSubmitted(true);
    await dispatch(forgotpassword({ email }));
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Wrapper>
        <Title>Forgot Password</Title>
        <Form onSubmit={handleClick}>
          <Description>
            Enter your email address and we'll send you a link to reset your
            password.
          </Description>
          <Input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {hasSubmitted && error && (
            <Message type="error">
              This email address is not registered. Please check and try again.
            </Message>
          )}
          {hasSubmitted && !error && !isFetching && (
            <Message type="success">
              Password reset link has been sent to your email address.
            </Message>
          )}
          <Button type="submit" disabled={isFetching}>
            {isFetching ? "Sending..." : "Send Reset Link"}
          </Button>
          <StyledLink to="/login">Back to sign in</StyledLink>
        </Form>
      </Wrapper>
    </Container>
  );
};

export default ForgotPassword;
