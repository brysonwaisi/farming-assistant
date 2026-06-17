import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan, { StreamOptions } from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import userRoute from './routes/user';
import authRoute from './routes/auth';
import productRoute from './routes/product';
import cartRoute from './routes/cart';
import orderRoute from './routes/order';
import stripeRoute from './routes/stripe';
import newsletterRoute from './routes/newsletter';
import wishlistRoute from './routes/wishlist';
import logger from './services/logger';
import { apiLimiter } from './middleware/rateLimit';
import openapiSpec from './docs/openapi';

const app = express();

const clientUrl = process.env.CLIENT_URL;
if (!clientUrl && process.env.NODE_ENV === 'production') {
  throw new Error('CLIENT_URL must be set in production');
}

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Farming Assistant Backend API.' });
});

app.get('/health', (req: Request, res: Response) => {
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
  app.use(morgan('tiny', { stream: logger.stream as unknown as StreamOptions }));
}

// API docs (before the rate limiter so browsing them isn't throttled).
app.get('/api/docs.json', (req: Request, res: Response) => res.json(openapiSpec));
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

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// eslint-disable-next-line no-unused-vars
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  const e = err as {
    name?: string;
    status?: number;
    message?: string;
    path?: string;
    value?: unknown;
    code?: number;
    keyValue?: unknown;
  };
  if (e.name === 'ApiError') {
    return res.status(e.status as number).json({ message: e.message });
  }
  if (e.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${e.path}: ${e.value}` });
  }
  if (e.name === 'ValidationError') {
    return res.status(400).json({ message: e.message });
  }
  if (e.code === 11000) {
    return res.status(409).json({ message: 'Duplicate key', keyValue: e.keyValue });
  }
  logger.error('Unhandled error', err);
  return res.status(e.status || 500).json({ message: e.message || 'Internal Server Error' });
});

export default app;
