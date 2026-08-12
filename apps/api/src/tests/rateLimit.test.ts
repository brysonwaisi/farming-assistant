import express, { RequestHandler } from 'express';
import request from 'supertest';

const loadLimiters = (nodeEnv: string) => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = nodeEnv;
  let limiters: { authLimiter: RequestHandler; apiLimiter: RequestHandler };
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    limiters = require('../middleware/rateLimit');
  });
  process.env.NODE_ENV = previous;
  return limiters!;
};

const appWith = (limiter: RequestHandler) => {
  const app = express();
  app.get('/limited', limiter, (req, res) => res.json({ ok: true }));
  return app;
};

describe('rate limiting', () => {
  it('production authLimiter returns 429 with a message after 10 attempts', async () => {
    const { authLimiter } = loadLimiters('production');
    const app = appWith(authLimiter);

    for (let i = 0; i < 10; i += 1) {
      expect((await request(app).get('/limited')).status).toBe(200);
    }
    const blocked = await request(app).get('/limited');
    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/too many attempts/i);
  });

  it('production apiLimiter allows normal traffic through', async () => {
    const { apiLimiter } = loadLimiters('production');
    const app = appWith(apiLimiter);
    expect((await request(app).get('/limited')).status).toBe(200);
  });

  it('non-production limiters are passthrough', async () => {
    const { authLimiter } = loadLimiters('test');
    const app = appWith(authLimiter);
    for (let i = 0; i < 15; i += 1) {
      expect((await request(app).get('/limited')).status).toBe(200);
    }
  });
});
