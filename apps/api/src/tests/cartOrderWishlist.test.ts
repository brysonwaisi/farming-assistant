import request from 'supertest';
import app from '../app';
import Product from '../models/Product';
import Wishlist from '../models/Wishlist';
import { authedAgent, createUser } from './helpers';

const makeProduct = () => Product.create({
  title: 'Tomatoes', desc: 'd', img: '/i.jpg', categories: ['veggies'], price: 100,
});

describe('Cart', () => {
  it('upserts and reads the owner cart; forces the authenticated userId', async () => {
    const { agent, user } = await authedAgent();
    const product = await makeProduct();

    const up = await agent
      .put(`/api/carts/find/${user._id}`)
      .send({ products: [{ productId: product._id, quantity: 3 }] });
    expect(up.status).toBe(200);
    expect(up.body.products).toHaveLength(1);

    const get = await agent.get(`/api/carts/find/${user._id}`);
    expect(get.status).toBe(200);
    expect(get.body.products[0].quantity).toBe(3);
  });

  it('blocks reading another user cart (403) and unauthenticated (401)', async () => {
    const { agent } = await authedAgent({ username: 'u1', email: 'u1@x.com' });
    const { user: other } = await createUser({ username: 'u2', email: 'u2@x.com' });

    const forbidden = await agent.get(`/api/carts/find/${other._id}`);
    expect(forbidden.status).toBe(403);

    const unauth = await request(app).get(`/api/carts/find/${other._id}`);
    expect(unauth.status).toBe(401);
  });

  it('ignores a spoofed userId on POST (attributes to the caller)', async () => {
    const { agent, user } = await authedAgent({ username: 'u1', email: 'u1@x.com' });
    const { user: other } = await createUser({ username: 'u2', email: 'u2@x.com' });
    const res = await agent.post('/api/carts').send({ userId: other._id, products: [] });
    expect(res.status).toBe(201);
    expect(String(res.body.userId)).toBe(String(user._id));
  });
});

describe('Orders', () => {
  it('creates an order attributed to the caller and lists own orders', async () => {
    const { agent, user } = await authedAgent();
    const product = await makeProduct();
    const create = await agent.post('/api/orders').send({
      userId: '000000000000000000000000', // spoof attempt
      products: [{ productId: product._id, quantity: 1 }],
      amount: 100,
      address: { city: 'Nairobi' },
    });
    expect(create.status).toBe(201);
    expect(String(create.body.userId)).toBe(String(user._id));

    const list = await agent.get(`/api/orders/find/${user._id}`);
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
  });

  it('requires amount + address (validation -> 400)', async () => {
    const { agent } = await authedAgent();
    const res = await agent.post('/api/orders').send({ products: [] });
    expect(res.status).toBe(400);
  });

  it('blocks reading another user orders (403)', async () => {
    const { agent } = await authedAgent({ username: 'u1', email: 'u1@x.com' });
    const { user: other } = await createUser({ username: 'u2', email: 'u2@x.com' });
    const res = await agent.get(`/api/orders/find/${other._id}`);
    expect(res.status).toBe(403);
  });
});

describe('Wishlist', () => {
  it('adds idempotently and removes', async () => {
    const { agent, user } = await authedAgent();
    const product = await makeProduct();

    await agent.post(`/api/wishlist/${product._id}`);
    const second = await agent.post(`/api/wishlist/${product._id}`);
    expect(second.status).toBe(200);
    expect(second.body.products).toHaveLength(1); // no duplicate

    const removed = await agent.delete(`/api/wishlist/${product._id}`);
    expect(removed.status).toBe(200);
    expect(removed.body.products).toHaveLength(0);

    const stored = await Wishlist.findOne({ userId: user._id });
    expect(stored?.products).toHaveLength(0);
  });

  it('blocks reading another user wishlist (403)', async () => {
    const { agent } = await authedAgent({ username: 'u1', email: 'u1@x.com' });
    const { user: other } = await createUser({ username: 'u2', email: 'u2@x.com' });
    const res = await agent.get(`/api/wishlist/find/${other._id}`);
    expect(res.status).toBe(403);
  });
});
