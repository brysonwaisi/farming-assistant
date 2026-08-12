import { rateLimit } from 'express-rate-limit';
import type { Request, Response, NextFunction, RequestHandler } from 'express';

const json = (message: string): RequestHandler => (req: Request, res: Response) => res.status(429).json({ message });

const passthrough: RequestHandler = (req: Request, res: Response, next: NextFunction) => next();
const isProd = process.env.NODE_ENV === 'production';

const authLimiter: RequestHandler = isProd
  ? rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: json('Too many attempts. Please try again later.'),
  })
  : passthrough;

const apiLimiter: RequestHandler = isProd
  ? rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    handler: json('Too many requests. Please slow down.'),
  })
  : passthrough;

export { authLimiter, apiLimiter };
