import { createLogger, format, transports, Logger } from 'winston';
import 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const logDir = path.join(process.cwd(), 'log');
const datePatternConfiguration = {
  default: 'YYYY-MM-DD',
  everHour: 'YYYY-MM-DD-HH',
  everMinute: 'YYYY-MM-DD-THH-mm',
};
const numberOfDaysToKeepLog = 30;
const fileSizeToRotate = 1; // in megabytes

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: `${logDir}/%DATE%-results.log`,
  datePattern: datePatternConfiguration.everHour,
  zippedArchive: true,
  maxSize: `${fileSizeToRotate}m`,
  maxFiles: `${numberOfDaysToKeepLog}d`,
});

// Custom formatting for logs
const customFormat = format.printf(
  ({
    level, message, timestamp, metadata,
  }) => {
    const meta = metadata ? ` ${JSON.stringify(metadata)}` : '';
    const prefix = level === 'warn' ? '⚠' : '';

    return `[${level}] ${prefix} ${timestamp}: ${message}${meta}`;
  },
);

const logger = createLogger({
  // change level if in dev environment versus production
  level: env === 'development' ? 'verbose' : 'info',
  handleExceptions: true,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    customFormat,
  ),
  transports: [
    new transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat,
      ),
    }),
    dailyRotateFileTransport,
  ],
});

process.on('SIGINT', () => {
  logger.info('Graceful shutdown initiated');
  logger.on('finish', () => process.exit(0));
  logger.end();
});

// Overriding stream method for HTTP logging (morgan expects a { write } sink).
(logger as unknown as { stream: { write: (message: string) => void } }).stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Custom logger methods for more control over logging. winston types these as
// LeveledLogMethod (returning Logger); our wrappers return void, so attach them
// through a loosely-typed alias to override without fighting the base types.
const custom = logger as unknown as {
  error: (message: unknown, trace?: unknown, context?: unknown) => void;
  warn: (message: unknown, metadata?: Record<string, unknown>) => void;
  info: (message: unknown, metadata?: Record<string, unknown>) => void;
  debug: (message: unknown, metadata?: Record<string, unknown>) => void;
};

custom.error = (message, trace = '', context = '') => {
  logger.log('error', message as string, { trace, context });
};

custom.warn = (message, metadata = {}) => {
  logger.log('warn', message as string, metadata as Record<string, unknown>);
};

custom.info = (message, metadata = {}) => {
  logger.log('info', message as string, metadata as Record<string, unknown>);
};

custom.debug = (message, metadata = {}) => {
  logger.log('debug', message as string, metadata as Record<string, unknown>);
};

export default logger;
