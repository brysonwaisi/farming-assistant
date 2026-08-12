import {
  Facebook,
  Instagram,
  MailOutline,
  Phone,
  Pinterest,
  Room,
  Twitter,
} from "@material-ui/icons";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { mobile } from "../smallScreen";

const Container = styled.div`
  display: flex;
  ${mobile({ flexDirection: "column" })}
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const Logo = styled.h1``;

const Desc = styled.p`
  margin: 20px 0px;
`;

const SocialContainer = styled.div`
  display: flex;
`;

const SocialIcon = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  background-color: #${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
`;

const Center = styled.div`
  flex: 1;
  padding: 20px;
  ${mobile({ display: "none" })}
`;

const Title = styled.h3`
  margin-bottom: 30px;
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
`;

const ListItem = styled(Link)`
  width: 50%;
  margin-bottom: 10px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const Right = styled.div`
  flex: 1;
  padding: 20px;
  ${mobile({ backgroundColor: "#fff8f8" })}
`;

const ContactItem = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
`;

const Payment = styled.img`
  width: 50%;
  height: auto;
  object-fit: contain;
`;

const Footer = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  // Account-bound links go to the user's own pages when signed in, else to login.
  const account = isLoggedIn ? "/account" : "/login";
  const wishlist = isLoggedIn ? "/wishlist" : "/login";

  return (
    <Container>
      <Left>
        <Logo>FARMING ASSISTANT</Logo>
        <Desc>
          Farming Assistant is an innovative agricultural technology company
          dedicated to revolutionizing and enhancing modern farming practices
          through cutting-edge solutions. Farming Assistant aims to bridge the
          gap between traditional farming methods and the latest advancements in
          technology.
        </Desc>
        <SocialContainer>
          <SocialIcon color="3B5999">
            <Facebook />
          </SocialIcon>
          <SocialIcon color="E4405F">
            <Instagram />
          </SocialIcon>
          <SocialIcon color="55ACEE">
            <Twitter />
          </SocialIcon>
          <SocialIcon color="E60023">
            <Pinterest />
          </SocialIcon>
        </SocialContainer>
      </Left>
      <Center>
        <Title>Useful Links</Title>
        <List>
          <ListItem to="/">Home</ListItem>
          <ListItem to="/cart">Cart</ListItem>
          <ListItem to="/products/veggies">Vegetables</ListItem>
          <ListItem to="/products/fruits">Fruits</ListItem>
          <ListItem to="/products/cereals">Cereals</ListItem>
          <ListItem to={account}>My Account</ListItem>
          <ListItem to={account}>Order Tracking</ListItem>
          <ListItem to={wishlist}>Wishlist</ListItem>
          <ListItem to="/">Terms</ListItem>
        </List>
      </Center>
      <Right>
        <Title>Contact</Title>
        <ContactItem>
          <Room style={{ marginRight: "10px" }} /> 22 Riverside Drive ,
          Westalands Nairobi
        </ContactItem>
        <ContactItem>
          <Phone style={{ marginRight: "10px" }} /> +254 72 45 78
        </ContactItem>
        <ContactItem>
          <MailOutline style={{ marginRight: "10px" }} />{" "}
          contact@farmingassistant.com
        </ContactItem>
        <Payment src="https://i.ibb.co/Qfvn4z6/payment.png" alt="Accepted payment methods" />
      </Right>
    </Container>
  );
};

export default Footer;
