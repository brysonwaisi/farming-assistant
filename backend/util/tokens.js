const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TTL = '15m';
const ACCESS_COOKIE_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const signAccessToken = (userId) => jwt.sign(
  { userId },
  process.env.JWT_SECRET,
  { expiresIn: ACCESS_TTL },
);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const createRefreshToken = () => {
  const raw = crypto.randomBytes(40).toString('hex');
  return { raw, hash: hashToken(raw), expiresAt: new Date(Date.now() + REFRESH_TTL_MS) };
};

const setAccessCookie = (res, userId) => {
  const token = signAccessToken(userId);
  res.cookie('token', token, { ...baseCookie, maxAge: ACCESS_COOKIE_MS });
  return token;
};

const setRefreshCookie = (res, raw) => {
  res.cookie('refreshToken', raw, { ...baseCookie, maxAge: REFRESH_TTL_MS, path: '/api/auth' });
};

const clearAuthCookies = (res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken', { path: '/api/auth' });
};

module.exports = {
  signAccessToken,
  hashToken,
  createRefreshToken,
  setAccessCookie,
  setRefreshCookie,
  clearAuthCookies,
  REFRESH_TTL_MS,
};
