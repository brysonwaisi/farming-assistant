const jwt = require('jsonwebtoken');
const {
  signAccessToken, hashToken, createRefreshToken,
} = require('../util/tokens');
const { checkOwnership } = require('../middleware/tokenVerify');

describe('tokens util', () => {
  it('signs a verifiable 15-min access token carrying the userId', () => {
    const token = signAccessToken('abc123');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe('abc123');
    // ~15 minutes between iat and exp
    expect(decoded.exp - decoded.iat).toBe(15 * 60);
  });

  it('hashes a token deterministically and irreversibly', () => {
    expect(hashToken('secret')).toBe(hashToken('secret'));
    expect(hashToken('secret')).not.toBe('secret');
    expect(hashToken('a')).not.toBe(hashToken('b'));
  });

  it('creates a refresh token whose hash matches and expires in the future', () => {
    const { raw, hash, expiresAt } = createRefreshToken();
    expect(raw).toHaveLength(80); // 40 bytes hex
    expect(hash).toBe(hashToken(raw));
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});

describe('checkOwnership middleware', () => {
  const run = (user, params) => {
    const req = { user, params };
    const res = {
      statusCode: null,
      body: null,
      status(c) { this.statusCode = c; return this; },
      json(b) { this.body = b; return this; },
    };
    const next = jest.fn();
    checkOwnership(req, res, next);
    return { res, next };
  };

  it('allows the owner', () => {
    const { next } = run({ _id: 'u1', isAdmin: false }, { userId: 'u1' });
    expect(next).toHaveBeenCalled();
  });

  it('allows an admin acting on another user', () => {
    const { next } = run({ _id: 'admin', isAdmin: true }, { userId: 'u2' });
    expect(next).toHaveBeenCalled();
  });

  it('blocks a non-owner non-admin with 403', () => {
    const { res, next } = run({ _id: 'u1', isAdmin: false }, { userId: 'u2' });
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBeTruthy();
  });
});
