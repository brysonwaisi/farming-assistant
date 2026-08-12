import Cart from '../models/Cart';
import User from '../models/User';
import { authedAgent, createUser } from './helpers';

describe('Profile update is field-whitelisted', () => {
  it('ignores isAdmin in a self-update (no privilege escalation) but allows image', async () => {
    const { agent, user } = await authedAgent({ username: 'u', email: 'u@x.com', isAdmin: false });
    const res = await agent.put(`/api/users/${user._id}`).send({
      email: 'u2@x.com',
      image: 'https://cdn.example.com/avatars/abc.jpg',
      isAdmin: true,
      isVerified: true,
    });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('u2@x.com'); // allowed field changed
    expect(res.body.image).toBe('https://cdn.example.com/avatars/abc.jpg'); // avatar allowed
    expect(res.body.isAdmin).toBe(false); // escalation ignored

    const stored = await User.findById(user._id);
    expect(stored!.isAdmin).toBe(false);
  });

  it('ignores refreshTokenHash / other system fields', async () => {
    const { agent, user } = await authedAgent({ username: 'u', email: 'u@x.com' });
    await agent.put(`/api/users/${user._id}`).send({ refreshTokenHash: 'attacker', username: 'newname' });
    const stored = await User.findById(user._id).select('+refreshTokenHash');
    expect(stored!.username).toBe('newname');
    expect(stored!.refreshTokenHash).not.toBe('attacker');
  });
});

describe('Cart by document id respects ownership', () => {
  it('lets the owner update their cart by id', async () => {
    const { agent, user } = await authedAgent({ username: 'owner', email: 'o@x.com' });
    const cart = await Cart.create({ userId: user._id, products: [] });
    const res = await agent.put(`/api/carts/${cart._id}`).send({ products: [] });
    expect(res.status).toBe(200);
  });

  it("blocks updating another user's cart by id (403)", async () => {
    const { agent } = await authedAgent({ username: 'a', email: 'a@x.com' });
    const { user: other } = await createUser({ username: 'b', email: 'b@x.com' });
    const otherCart = await Cart.create({ userId: other._id, products: [] });
    const res = await agent.put(`/api/carts/${otherCart._id}`).send({ products: [] });
    expect(res.status).toBe(403);
  });

  it("blocks deleting another user's cart by id (403)", async () => {
    const { agent } = await authedAgent({ username: 'a', email: 'a@x.com' });
    const { user: other } = await createUser({ username: 'b', email: 'b@x.com' });
    const otherCart = await Cart.create({ userId: other._id, products: [] });
    const res = await agent.delete(`/api/carts/${otherCart._id}`);
    expect(res.status).toBe(403);
    expect(await Cart.findById(otherCart._id)).not.toBeNull();
  });
});
