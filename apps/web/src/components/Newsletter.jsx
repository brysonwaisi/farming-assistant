import { Send } from "@material-ui/icons";
import styled from "styled-components";
import { mobile } from "../smallScreen";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { subscriptions } from "../redux/apiCalls";

const Container = styled.div`
  height: 60vh;
  background-color: #fcf5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;
const Title = styled.h1`
  font-size: 70px;
  margin-bottom: 20px;
`;

const Desc = styled.div`
  font-size: 24px;
  font-weight: 300;
  margin-bottom: 20px;
  ${mobile({ textAlign: "center" })}
`;

const InputContainer = styled.div`
  width: 50%;
  height: 40px;
  background-color: white;
  display: flex;
  justify-content: space-between;
  border: 1px solid lightgray;
  ${mobile({ width: "80%" })}
`;

const Input = styled.input`
  border: none;
  flex: 8;
  padding-left: 20px;
`;

const Button = styled.button`
  flex: 1;
  border: none;
  background-color: teal;
  color: white;
`;
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [emailerror, setEmailerror] = useState("");
  const dispatch = useDispatch();

  const { isLoading, success, error } = useSelector((state) => state.sub);
  const handleSubscription = async () => {
    if (!email.trim()) {
      setEmailerror("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setEmailerror("Please enter a valid email");
      return;
    }
    setEmailerror("");
    dispatch(subscriptions({ email }));
    setEmail("");
  };

  return (
    <Container>
      <Title>Newsletter</Title>
      <Desc>Get timely updates from your favorite products.</Desc>
      <InputContainer>
      
        <Input
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleSubscription}>
          <Send />
        </Button>
      </InputContainer>
      {isLoading && <p>Loading...</p>}
      {emailerror && <p>{emailerror}</p>}
      {!emailerror && error && <p>Subscription failed. Please try again.</p>}
      {!emailerror && !error && success && <p>Subscription successful!</p>}
    </Container>
  );
};

export default Newsletter;