import { useState } from "react";
import styled from "styled-components";
import { mobile, tablet } from "../smallScreen";
import { useDispatch } from "react-redux";
import { signup } from "../redux/apiCalls";
import { useNavigate, Link } from "react-router-dom";
import { motion } from 'framer-motion'
import backgroundImage from '../assets/home.svg'

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
  width: 40%;
  padding: 20px;
  border-radius: 20px;
  background-color: beige;
  ${tablet({ width: "65%" })}
  ${mobile({ width: "85%" })}
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 300;
`;


const Form = styled.form`
  display: flex;
  flex-wrap: wrap;
`;

const Input = styled.input`
  flex: 1;
  min-width: 40%;
  margin: 20px 10px 0px 0px;
  padding: 10px;
  border-radius: 6px;
  font-size: 22px;
`;

const Agreement = styled.span`
  font-size: 15px;
  margin: 20px 0px;
`;

const Button = styled.button`
  width: 40%;
  border: none;
  padding: 15px 20px;
  background-color: teal;
  color: white;
  cursor: pointer;
  font-size: 18px;
  border-radius: 10px;
  &:hover {
    background-color: #00695c;
  }
`;

const StyledLink = styled(Link)`
  margin-top: 14px;
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

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(signup(formData));
    navigate("/login");
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Wrapper>
        <Title>CREATE AN ACCOUNT</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            name="name"
            placeholder="first name"
            autoComplete="given-name"
            onChange={handleChange}
          />
          <Input
            name="lastName"
            placeholder="last name"
            autoComplete="family-name"
            onChange={handleChange}
          />
          <Input
            name="username"
            placeholder="username"
            autoComplete="username"
            onChange={handleChange}
          />
          <Input
            name="email"
            placeholder="email"
            type="email"
            autoComplete="email"
            onChange={handleChange}
          />
          <Input
            name="password"
            placeholder="password"
            type="password"
            autoComplete="new-password"
            onChange={handleChange}
          />
          <Input
            name="confirmPassword"
            placeholder="confirm password"
            type="password"
            autoComplete="new-password"
            onChange={handleChange}
          />
          <Agreement>
            By creating an account, I consent to the processing of my personal
            data in accordance with the <b>PRIVACY POLICY</b>
          </Agreement>
          <Button type="submit">CREATE</Button>
          <StyledLink to="/login">Already have an account? Sign in</StyledLink>
        </Form>
      </Wrapper>
    </Container>
  );
};

export default Register;

