import request from 'supertest';
import app from '../app';

describe('Newsletter', () => {
  it('subscribes a valid email', async () => {
    const res = await request(app).post('/api/subscribe').send({ email: 'sub@example.com' });
    expect(res.status).toBe(201);
  });

  it('rejects an invalid email with 400', async () => {
    const res = await request(app).post('/api/subscribe').send({ email: 'nope' });
    expect(res.status).toBe(400);
  });

  it('rejects a duplicate subscription with 409', async () => {
    await request(app).post('/api/subscribe').send({ email: 'dupe@example.com' });
    const res = await request(app).post('/api/subscribe').send({ email: 'dupe@example.com' });
    expect(res.status).toBe(409);
  });
});

describe('Unknown route', () => {
  it('returns 404 with a message', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.message).toBeTruthy();
  });
});
