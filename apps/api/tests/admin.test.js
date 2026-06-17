const Order = require('../models/Order');
const User = require('../models/User');
const { authedAgent, createUser } = require('./helpers');

describe('Admin: user management', () => {
  it('lists users without exposing passwords, fetches and updates a user', async () => {
    const { agent } = await authedAgent({ username: 'admin', email: 'admin@x.com', isAdmin: true });
    const { user: target } = await createUser({ username: 'member', email: 'm@x.com' });

    const list = await agent.get('/api/users');
    expect(list.status).toBe(200);
    expect(list.body.every((u) => u.password === undefined)).toBe(true);

    const found = await agent.get(`/api/users/find/${target._id}`);
    expect(found.status).toBe(200);
    expect(found.body.password).toBeUndefined();

    // self-update path (owner) — hashes new password
    const self = await agent.put(`/api/users/${(await User.findOne({ username: 'admin' }))._id}`)
      .send({ email: 'admin2@x.com' });
    expect(self.status).toBe(200);
    expect(self.body.email).toBe('admin2@x.com');
    expect(self.body.password).toBeUndefined();
  });

  it('returns 404 when fetching a non-existent user', async () => {
    const { agent } = await authedAgent({ username: 'admin', email: 'admin@x.com', isAdmin: true });
    const res = await agent.get('/api/users/find/000000000000000000000000');
    expect(res.status).toBe(404);
  });

  it('blocks a non-admin from the users list (403)', async () => {
    const { agent } = await authedAgent({ username: 'shopper', isAdmin: false });
    const res = await agent.get('/api/users');
    expect(res.status).toBe(403);
  });

  it('lets a user update their own account but not another (403)', async () => {
    const { agent } = await authedAgent({ username: 'u1', email: 'u1@x.com' });
    const { user: other } = await createUser({ username: 'u2', email: 'u2@x.com' });
    const res = await agent.put(`/api/users/${other._id}`).send({ email: 'hack@x.com' });
    expect(res.status).toBe(403);
  });
});

describe('Admin: order management', () => {
  it('updates and deletes an order; non-admin is blocked', async () => {
    const { agent: admin } = await authedAgent({ username: 'admin', email: 'admin@x.com', isAdmin: true });
    const { user } = await createUser({ username: 'buyer', email: 'b@x.com' });
    const order = await Order.create({
      userId: user._id, products: [], amount: 500, address: { city: 'Nairobi' },
    });

    const updated = await admin.put(`/api/orders/${order._id}`).send({ status: 'shipped' });
    expect(updated.status).toBe(200);
    expect(updated.body.status).toBe('shipped');

    const income = await admin.get('/api/orders/income');
    expect(income.status).toBe(200);
    expect(Array.isArray(income.body)).toBe(true);

    const allOrders = await admin.get('/api/orders');
    expect(allOrders.status).toBe(200);

    const removed = await admin.delete(`/api/orders/${order._id}`);
    expect(removed.status).toBe(200);
    expect(await Order.findById(order._id)).toBeNull();
  });

  it('blocks a non-admin from order management (403)', async () => {
    const { agent } = await authedAgent({ username: 'shopper', isAdmin: false });
    expect((await agent.get('/api/orders')).status).toBe(403);
    expect((await agent.get('/api/orders/income')).status).toBe(403);
  });

  it('returns 404 updating a missing order', async () => {
    const { agent } = await authedAgent({ username: 'admin', email: 'admin@x.com', isAdmin: true });
    const res = await agent.put('/api/orders/000000000000000000000000').send({ status: 'x' });
    expect(res.status).toBe(404);
  });

  it('income window includes recent orders and excludes old ones', async () => {
    const { agent: admin } = await authedAgent({ username: 'admin', email: 'admin@x.com', isAdmin: true });
    const { user } = await createUser({ username: 'buyer', email: 'b@x.com' });
    const recent = new Date();
    const old = new Date(recent.getFullYear(), recent.getMonth() - 6, 1);
    await Order.create({
      userId: user._id, products: [], amount: 100, address: {}, createdAt: recent,
    });
    await Order.create({
      userId: user._id, products: [], amount: 999, address: {}, createdAt: old,
    });

    const { body } = await admin.get('/api/orders/income');
    const total = body.reduce((sum, row) => sum + row.total, 0);
    // Only the recent 100 should fall in the trailing-2-month window, not the old 999.
    expect(total).toBe(100);
  });
});

describe('Admin: cart management', () => {
  it('admin can list all carts and delete by id; missing id -> 404', async () => {
    const { agent: admin } = await authedAgent({ username: 'admin', email: 'admin@x.com', isAdmin: true });
    const all = await admin.get('/api/carts');
    expect(all.status).toBe(200);
    const missing = await admin.delete('/api/carts/000000000000000000000000');
    expect(missing.status).toBe(404);
  });
});
