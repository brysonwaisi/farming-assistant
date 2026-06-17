import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/userRedux";
import { useNavigate } from "react-router-dom";
import { pubRequest } from "../reqMethods";
import Button from "../components/Button";
import type { RootState, AppDispatch } from "../redux/store";

const Container = styled.div`
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const Title = styled.h2`
  font-weight: 300;
`;

const Logout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isLoggedIn } = useSelector((state: RootState) => state.user);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      await pubRequest.post("/auth/logout");
    } catch (err) {
      // Ignore network errors; still clear local session below.
    }
    dispatch(logout());
    localStorage.removeItem("persist:root");
    navigate("/login");
  };

  return (
    <Container>
      {isLoggedIn && (
        <>
          <Title>Ready to leave?</Title>
          <Button onClick={handleLogout}>Logout</Button>
        </>
      )}
    </Container>
  );
};

export default Logout;
