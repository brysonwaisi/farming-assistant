import styled from "styled-components";
import { mobile, tablet } from "../smallScreen";
import { useDispatch, useSelector } from "react-redux";
import { resetpassword } from "../redux/apiCalls";
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import backgroundImage from "../assets/home.svg";
import type { RootState, AppDispatch } from "../redux/store";

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

const StyledLink = styled(Link)`
  font-size: 15px;
  color: teal;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
    color: #00695c;
  }
`;

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const { isFetching, error, passwordFlowSuccess } = useSelector(
    (state: RootState) => state.user
  );
  const dispatch = useDispatch<AppDispatch>();

  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  // Redirect to login after a successful reset; cleaned up on unmount.
  useEffect(() => {
    if (passwordFlowSuccess) {
      const timer = setTimeout(() => navigate("/login"), 4000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [passwordFlowSuccess, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match");
      return;
    }
    if (!token) {
      return;
    }
    dispatch(resetpassword({ token, password: newPassword }));
  };
  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Wrapper>
        <Title>Reset Password</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewPassword(e.target.value)
            }
            required
          />
          <Input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="confirm password"
            value={confirmNewPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmNewPassword(e.target.value)
            }
            required
          />

          <Button type="submit" disabled={isFetching}>
            Continue
          </Button>
          <StyledLink to="/login">Back to sign in</StyledLink>
        </Form>
      </Wrapper>
    </Container>
  );
};

export default ResetPassword;
