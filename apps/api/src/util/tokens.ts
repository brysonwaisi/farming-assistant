import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Response } from 'express';

const ACCESS_TTL = '15m';
const ACCESS_COOKIE_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

const signAccessToken = (userId: string): string => jwt.sign(
  { userId },
  process.env.JWT_SECRET as string,
  { expiresIn: ACCESS_TTL },
);

const hashToken = (token: string): string => crypto.createHash('sha256').update(token).digest('hex');

const createRefreshToken = (): { raw: string; hash: string; expiresAt: Date } => {
  const raw = crypto.randomBytes(40).toString('hex');
  return { raw, hash: hashToken(raw), expiresAt: new Date(Date.now() + REFRESH_TTL_MS) };
};

const setAccessCookie = (res: Response, userId: string): string => {
  const token = signAccessToken(userId);
  res.cookie('token', token, { ...baseCookie, maxAge: ACCESS_COOKIE_MS });
  return token;
};

const setRefreshCookie = (res: Response, raw: string): void => {
  res.cookie('refreshToken', raw, { ...baseCookie, maxAge: REFRESH_TTL_MS, path: '/api/auth' });
};

const clearAuthCookies = (res: Response): void => {
  res.clearCookie('token');
  res.clearCookie('refreshToken', { path: '/api/auth' });
};

export {
  signAccessToken,
  hashToken,
  createRefreshToken,
  setAccessCookie,
  setRefreshCookie,
  clearAuthCookies,
  REFRESH_TTL_MS,
};
