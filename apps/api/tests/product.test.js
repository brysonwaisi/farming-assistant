const request = require('supertest');
const app = require('../app');
const Product = require('../models/Product');
const { authedAgent } = require('./helpers');

const sample = (over = {}) => ({
  title: 'Tomatoes',
  desc: 'Fresh tomatoes',
  img: '/img.jpg',
  categories: ['veggies'],
  type: ['organic'],
  price: 100,
  ...over,
});

const seed = (over) => Product.create(sample(over));

describe('Products', () => {
  describe('reads (public)', () => {
    it('lists all products', async () => {
      await seed({ title: 'A' });
      await seed({ title: 'B' });
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('filters by category', async () => {
      await seed({ title: 'Veg', categories: ['veggies'] });
      await seed({ title: 'Fruit', categories: ['fruits'] });
      const res = await request(app).get('/api/products?category=fruits');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Fruit');
    });

    it('searches title/desc/category (case-insensitive, regex-safe)', async () => {
      await seed({ title: 'Sweet Banana' });
      await seed({ title: 'Maize' });
      const res = await request(app).get('/api/products?search=banana');
      expect(res.status).toBe(200);
      expect(res.body.map((p) => p.title)).toEqual(['Sweet Banana']);

      // a regex-special term must not crash
      const safe = await request(app).get('/api/products?search=%28%2A');
      expect(safe.status).toBe(200);
      expect(safe.body).toEqual([]);
    });

    it('returns 404 for a missing product and 400 for a malformed id', async () => {
      const missing = await request(app).get('/api/products/find/000000000000000000000000');
      expect(missing.status).toBe(404);
      const bad = await request(app).get('/api/products/find/not-an-id');
      expect(bad.status).toBe(400);
    });
  });

  describe('writes (admin only)', () => {
    it('blocks a non-admin from creating (403)', async () => {
      const { agent } = await authedAgent({ username: 'shopper', isAdmin: false });
      const res = await agent.post('/api/products').send(sample());
      expect(res.status).toBe(403);
    });

    it('blocks an unauthenticated create (401)', async () => {
      const res = await request(app).post('/api/products').send(sample());
      expect(res.status).toBe(401);
    });

    it('lets an admin create, update, and delete', async () => {
      const { agent } = await authedAgent({ username: 'admin', email: 'a@a.com', isAdmin: true });

      const created = await agent.post('/api/products').send(sample({ title: 'Carrots' }));
      expect(created.status).toBe(201);
      const id = created.body._id;

      const updated = await agent.put(`/api/products/${id}`).send({ price: 250 });
      expect(updated.status).toBe(200);
      expect(updated.body.price).toBe(250);

      const removed = await agent.delete(`/api/products/${id}`);
      expect(removed.status).toBe(200);
      expect(await Product.findById(id)).toBeNull();
    });

    it('rejects a duplicate title with 409', async () => {
      const { agent } = await authedAgent({ username: 'admin', email: 'a@a.com', isAdmin: true });
      await seed({ title: 'Unique' });
      const res = await agent.post('/api/products').send(sample({ title: 'Unique' }));
      expect(res.status).toBe(409);
    });
  });
});
