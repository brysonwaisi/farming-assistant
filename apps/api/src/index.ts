import dotenv from 'dotenv';
import http from 'http';
import connectDB from './db/config';
import logger from './services/logger';

dotenv.config();

import app from './app';

const server = http.createServer(app);

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled promise rejection', reason);
});
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught exception', err);
});

const normalizePort = (val: string): number | string | false => {
  const port = parseInt(val, 10);
  if (Number.isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || '5000');
app.set('port', port);

const errorHandler = (error: NodeJS.ErrnoException): void => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? `pipe ${address}` : `port: ${port}`;
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges.`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use.`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

server.on('error', errorHandler);

server.listen(port, () => {
  connectDB();
  const address = server.address();
  const bind = typeof address === 'string' ? `pipe ${address}` : `port ${port}`;
  if (process.env.NODE_ENV === 'production') {
    logger.info(`Production Server is running on ${bind}`);
  } else {
    logger.info(`Development Server is running on ${bind}`);
  }
});
