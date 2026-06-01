import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Welcome from "../components/Welcome";
import Footer from "../components/Footer";
import Button from "../components/Button";
import { userRequest } from "../reqMethods";
import { updateProfile, uploadAvatar } from "../redux/apiCalls";
import { colors } from "../theme";
import { mobile } from "../smallScreen";

const AVATAR_FALLBACK =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <rect width="120" height="120" fill="#e9eef0"/>
      <circle cx="60" cy="46" r="22" fill="#b8c4c9"/>
      <ellipse cx="60" cy="100" rx="38" ry="26" fill="#b8c4c9"/>
    </svg>`
  );

const Container = styled.div``;

const Wrapper = styled.div`
  padding: 30px;
  ${mobile({ padding: "15px" })}
`;

const Title = styled.h1`
  font-weight: 300;
`;

const Panel = styled.div`
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 24px;
  max-width: 560px;
`;

const AvatarBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
`;

const Avatar = styled.img`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  background-color: ${colors.lightBg};
  border: 1px solid #eee;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f4f4f4;
  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  color: ${colors.muted};
`;

const SectionTitle = styled.h2`
  font-weight: 300;
  margin: 10px 0 16px;
`;

const OrderCard = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
  max-width: 560px;
`;

const Muted = styled.p`
  color: ${colors.muted};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 560px;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: ${colors.muted};
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 8px 0 30px;
`;

const Note = styled.p`
  color: ${(props) => (props.error ? colors.error : "green")};
  font-size: 14px;
`;

const Account = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [mode, setMode] = useState(null); // null | 'profile'
  const [form, setForm] = useState({ username: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { error, message }
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!currentUser?._id) return undefined;
    let active = true;
    const load = async () => {
      setLoadingOrders(true);
      try {
        const res = await userRequest.get(`/orders/find/${currentUser._id}`);
        if (active) setOrders(res.data || []);
      } catch (err) {
        if (active) setOrders([]);
      } finally {
        if (active) setLoadingOrders(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [currentUser]);

  if (!currentUser) return null;

  const openProfile = () => {
    setForm({ username: currentUser.username, email: currentUser.email });
    setFeedback(null);
    setMode("profile");
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFeedback({ error: true, message: "Please choose an image file." });
      return;
    }
    setFeedback(null);
    setUploadingAvatar(true);
    const res = await uploadAvatar(dispatch, currentUser._id, file);
    setUploadingAvatar(false);
    setFeedback(
      res.ok
        ? { error: false, message: "Photo updated." }
        : { error: true, message: res.message },
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  const saveProfile = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);
    const res = await updateProfile(dispatch, currentUser._id, {
      username: form.username.trim(),
      email: form.email.trim(),
    });
    setSaving(false);
    if (res.ok) {
      setFeedback({ error: false, message: "Profile updated." });
      setMode(null);
    } else {
      setFeedback({ error: true, message: res.message });
    }
  };

  return (
    <Container>
      <Navbar />
      <Welcome />
      <Wrapper>
        <Title>My Account</Title>

        {mode === "profile" ? (
          <Form onSubmit={saveProfile}>
            <Field>
              Username
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </Field>
            <Field>
              Email
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Field>
            <Actions>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setMode(null)}>
                Cancel
              </Button>
            </Actions>
          </Form>
        ) : (
          <>
            <AvatarBlock>
              <Avatar
                src={currentUser.image || AVATAR_FALLBACK}
                alt={`${currentUser.username}'s avatar`}
                onError={(ev) => {
                  ev.target.src = AVATAR_FALLBACK;
                }}
              />
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? "Uploading..." : "Change photo"}
                </Button>
              </div>
            </AvatarBlock>
            <Panel>
              <Row>
                <Label>Username</Label>
                <span>{currentUser.username}</span>
              </Row>
              <Row>
                <Label>Email</Label>
                <span>{currentUser.email}</span>
              </Row>
              <Row>
                <Label>Email verified</Label>
                <span>{currentUser.isVerified ? "Yes" : "No"}</span>
              </Row>
              <Row>
                <Label>Member since</Label>
                <span>
                  {currentUser.createdAt
                    ? new Date(currentUser.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </Row>
            </Panel>
            <Actions>
              <Button onClick={openProfile}>Edit profile</Button>
              <Button variant="outline" onClick={() => navigate("/wishlist")}>
                My Wishlist
              </Button>
              <Button variant="outline" onClick={() => navigate("/cart")}>
                My Cart
              </Button>
            </Actions>
          </>
        )}

        {feedback && <Note error={feedback.error}>{feedback.message}</Note>}

        <SectionTitle>Order history</SectionTitle>
        {loadingOrders && <Muted>Loading your orders...</Muted>}
        {!loadingOrders && orders.length === 0 && (
          <Muted>You have no orders yet.</Muted>
        )}
        {orders.map((order) => (
          <OrderCard key={order._id}>
            <Row>
              <Label>Order</Label>
              <span>{order._id}</span>
            </Row>
            <Row>
              <Label>Date</Label>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </Row>
            <Row>
              <Label>Items</Label>
              <span>{order.products?.length || 0}</span>
            </Row>
            <Row>
              <Label>Amount</Label>
              <span>KES {order.amount}</span>
            </Row>
            <Row>
              <Label>Status</Label>
              <span>{order.status}</span>
            </Row>
          </OrderCard>
        ))}
      </Wrapper>
      <Footer />
    </Container>
  );
};

export default Account;
