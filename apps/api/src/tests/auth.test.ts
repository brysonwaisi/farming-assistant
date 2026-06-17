// Email sending is an external side-effect; stub it so tests stay hermetic.
jest.mock('../mailtrap/emails', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendResetSuccessEmail: jest.fn().mockResolvedValue(undefined),
}));

import request, { Response } from 'supertest';
import app from '../app';
import User from '../models/User';
import { createUser } from './helpers';

const getCookies = (res: Response): string[] => (res.headers['set-cookie'] as string[] | undefined) || [];
const hasCookie = (res: Response, name: string): boolean => getCookies(res).some((c) => c.startsWith(`${name}=`));

describe('Auth', () => {
  describe('POST /api/auth/register', () => {
    it('creates a user, sets access + refresh cookies, hides the password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'alice',
        email: 'alice@example.com',
        password: 'secret1',
      });
      expect(res.status).toBe(201);
      expect(res.body.username).toBe('alice');
      expect(res.body.password).toBeUndefined();
      expect(res.body.refreshTokenHash).toBeUndefined();
      expect(hasCookie(res, 'token')).toBe(true);
      expect(hasCookie(res, 'refreshToken')).toBe(true);

      const stored = await User.findOne({ username: 'alice' }).select('+refreshTokenHash');
      expect(stored!.password).not.toBe('secret1'); // hashed
      expect(stored!.refreshTokenHash).toBeTruthy();
    });

    it('rejects duplicate username/email with 409', async () => {
      await createUser({ username: 'bob', email: 'bob@example.com' });
      const res = await request(app).post('/api/auth/register').send({
        username: 'bob',
        email: 'bob@example.com',
        password: 'secret1',
      });
      expect(res.status).toBe(409);
    });

    it.each([
      ['short username', { username: 'ab', email: 'x@y.com', password: 'secret1' }],
      ['bad email', { username: 'okname', email: 'nope', password: 'secret1' }],
      ['short password', { username: 'okname', email: 'x@y.com', password: '123' }],
      ['missing fields', {}],
    ])('rejects %s with 400', async (_label: string, body: Record<string, unknown>) => {
      const res = await request(app).post('/api/auth/register').send(body);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials and sets cookies', async () => {
      await createUser({ username: 'carol', password: 'mypass1' });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'carol', password: 'mypass1' });
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('carol');
      expect(res.body.password).toBeUndefined();
      expect(hasCookie(res, 'token')).toBe(true);
      expect(hasCookie(res, 'refreshToken')).toBe(true);
    });

    it('rejects wrong password with 401', async () => {
      await createUser({ username: 'dave', password: 'rightpass' });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'dave', password: 'wrongpass' });
      expect(res.status).toBe(401);
    });

    it('rejects unknown username with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'ghost', password: 'whatever' });
      expect(res.status).toBe(401);
    });

    it('updates lastLogin', async () => {
      await createUser({ username: 'erin', password: 'mypass1' });
      await request(app).post('/api/auth/login').send({ username: 'erin', password: 'mypass1' });
      const u = await User.findOne({ username: 'erin' });
      expect(u!.lastLogin).toBeTruthy();
    });
  });

  describe('refresh + check-auth + logout', () => {
    const agent = () => request.agent(app); // persists cookies across calls

    it('check-auth works, refresh rotates the token, logout revokes it', async () => {
      await createUser({ username: 'frank', password: 'mypass1' });
      const a = agent();
      await a.post('/api/auth/login').send({ username: 'frank', password: 'mypass1' });

      const check = await a.get('/api/auth/check-auth');
      expect(check.status).toBe(200);
      expect(check.body.user.username).toBe('frank');

      const before = await User.findOne({ username: 'frank' }).select('+refreshTokenHash');
      const refresh = await a.post('/api/auth/refresh');
      expect(refresh.status).toBe(200);
      const after = await User.findOne({ username: 'frank' }).select('+refreshTokenHash');
      expect(after!.refreshTokenHash).not.toBe(before!.refreshTokenHash); // rotated

      const logout = await a.post('/api/auth/logout');
      expect(logout.status).toBe(200);
      const cleared = await User.findOne({ username: 'frank' }).select('+refreshTokenHash');
      expect(cleared!.refreshTokenHash).toBeFalsy();
    });

    it('check-auth without a token returns 401', async () => {
      const res = await request(app).get('/api/auth/check-auth');
      expect(res.status).toBe(401);
    });

    it('refresh without a valid refresh token returns 401', async () => {
      const res = await request(app).post('/api/auth/refresh');
      expect(res.status).toBe(401);
    });
  });

  describe('verify-email / forgot / reset', () => {
    it('verifies email with the correct code', async () => {
      // register to generate a verification token
      await request(app).post('/api/auth/register').send({
        username: 'gina', email: 'gina@example.com', password: 'secret1',
      });
      const u = await User.findOne({ username: 'gina' });
      const res = await request(app).post('/api/auth/verify-email').send({ code: u!.verificationToken });
      expect(res.status).toBe(200);
      expect(res.body.user.isVerified).toBe(true);
    });

    it('rejects an invalid verification code', async () => {
      const res = await request(app).post('/api/auth/verify-email').send({ code: '000000' });
      expect(res.status).toBe(400);
    });

    it('forgot-password issues a reset token for a known email', async () => {
      await createUser({ username: 'hank', email: 'hank@example.com' });
      const res = await request(app).post('/api/auth/forgot-password').send({ email: 'hank@example.com' });
      expect(res.status).toBe(200);
      const u = await User.findOne({ email: 'hank@example.com' });
      expect(u!.resetPasswordToken).toBeTruthy();
    });

    it('forgot-password returns 200 for an unknown email (no user enumeration)', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({ email: 'nobody@example.com' });
      // Same response as a known email; no token created since the user doesn't exist.
      expect(res.status).toBe(200);
      const u = await User.findOne({ email: 'nobody@example.com' });
      expect(u).toBeNull();
    });

    it('reset-password changes the password and allows login with it', async () => {
      const { user } = await createUser({ username: 'ivy', email: 'ivy@example.com' });
      user.resetPasswordToken = 'resettoken123';
      user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      const reset = await request(app)
        .post('/api/auth/reset-password/resettoken123')
        .send({ password: 'brandnew1' });
      expect(reset.status).toBe(200);

      const login = await request(app)
        .post('/api/auth/login')
        .send({ username: 'ivy', password: 'brandnew1' });
      expect(login.status).toBe(200);
    });

    it('reset-password rejects an invalid/expired token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password/badtoken')
        .send({ password: 'brandnew1' });
      expect(res.status).toBe(400);
    });
  });
});
