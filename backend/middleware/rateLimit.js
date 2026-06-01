const rateLimit = require('express-rate-limit');

const json = (message) => (req, res) => res.status(429).json({ message });

const passthrough = (req, res, next) => next();
const isProd = process.env.NODE_ENV === 'production';

const authLimiter = isProd
  ? rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: json('Too many attempts. Please try again later.'),
  })
  : passthrough;

const apiLimiter = isProd
  ? rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    handler: json('Too many requests. Please slow down.'),
  })
  : passthrough;

module.exports = { authLimiter, apiLimiter };
