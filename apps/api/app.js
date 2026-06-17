const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const userRoute = require('./routes/user');
const authRoute = require('./routes/auth');
const productRoute = require('./routes/product');
const cartRoute = require('./routes/cart');
const orderRoute = require('./routes/order');
const stripeRoute = require('./routes/stripe');
const newsletterRoute = require('./routes/newsletter');
const wishlistRoute = require('./routes/wishlist');
const logger = require('./services/logger');
const { apiLimiter } = require('./middleware/rateLimit');
const openapiSpec = require('./docs/openapi');

const app = express();

const clientUrl = process.env.CLIENT_URL;
if (!clientUrl && process.env.NODE_ENV === 'production') {
  throw new Error('CLIENT_URL must be set in production');
}

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Farming Assistant Backend API.' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: clientUrl || 'http://localhost:5173',
    credentials: true,
  }),
);

// Skip request logging during tests to keep output clean.
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('tiny', { stream: logger.stream }));
}

// API docs (before the rate limiter so browsing them isn't throttled).
app.get('/api/docs.json', (req, res) => res.json(openapiSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
  customSiteTitle: 'Farming Assistant API',
}));

app.use('/api', apiLimiter);

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/products', productRoute);
app.use('/api/carts', cartRoute);
app.use('/api/orders', orderRoute);
app.use('/api/checkout', stripeRoute);
app.use('/api/subscribe', newsletterRoute);
app.use('/api/wishlist', wishlistRoute);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err.name === 'ApiError') {
    return res.status(err.status).json({ message: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate key', keyValue: err.keyValue });
  }
  logger.error('Unhandled error', err);
  return res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
