import request from 'supertest';
import User from '../models/User';
import app from '../app';
import { authedAgent, createUser } from './helpers';

describe('User self-management', () => {
  it('changes the password (hashed) and allows login with the new one', async () => {
    const { agent, user } = await authedAgent();
    const res = await agent.put(`/api/users/${user._id}`).send({ password: 'new-test-password-1' });
    expect(res.status).toBe(200);

    const stored = await User.findById(user._id).select('+password');
    expect(stored!.password).not.toBe('new-test-password-1');

    const login = await request(app)
      .post('/api/auth/login')
      .send({ username: user.username, password: 'new-test-password-1' });
    expect(login.status).toBe(200);
  });

  it('deletes the own account', async () => {
    const { agent, user } = await authedAgent();
    const res = await agent.delete(`/api/users/${user._id}`);
    expect(res.status).toBe(200);
    expect(await User.findById(user._id)).toBeNull();
  });

  it('blocks deleting another user (403)', async () => {
    const { agent } = await authedAgent({ username: 'u1', email: 'u1@x.com' });
    const { user: other } = await createUser({ username: 'u2', email: 'u2@x.com' });
    const res = await agent.delete(`/api/users/${other._id}`);
    expect(res.status).toBe(403);
    expect(await User.findById(other._id)).not.toBeNull();
  });

  it('returns 404 deleting a missing user as admin', async () => {
    const { agent } = await authedAgent({ username: 'admin', email: 'a@x.com', isAdmin: true });
    const res = await agent.delete('/api/users/000000000000000000000000');
    expect(res.status).toBe(404);
  });
});

describe('User stats', () => {
  it('returns monthly registration buckets for an admin', async () => {
    const { agent } = await authedAgent({ username: 'admin', email: 'a@x.com', isAdmin: true });
    await createUser({ username: 'u1', email: 'u1@x.com' });
    await createUser({ username: 'u2', email: 'u2@x.com' });

    const res = await agent.get('/api/users/stats');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const total = res.body.reduce(
      (sum: number, row: { total: number }) => sum + row.total,
      0,
    );
    expect(total).toBe(3);
  });

  it('blocks a non-admin (403)', async () => {
    const { agent } = await authedAgent();
    const res = await agent.get('/api/users/stats');
    expect(res.status).toBe(403);
  });
});

describe('User list ?new=true', () => {
  it('returns the most recent users first, capped at 5', async () => {
    const { agent } = await authedAgent({ username: 'admin', email: 'a@x.com', isAdmin: true });
    for (let i = 0; i < 6; i += 1) {
      await createUser({ username: `u${i}`, email: `u${i}@x.com` });
    }
    const res = await agent.get('/api/users?new=true');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
    expect(res.body[0].username).toBe('u5');
  });
});
