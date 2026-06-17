const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');

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
  compress: 'gzip',
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

// Overriding stream method for HTTP logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Custom logger methods for more control over logging
logger.error = (message, trace = '', context = '') => {
  logger.log('error', message, { trace, context });
};

logger.warn = (message, metadata = {}) => {
  logger.log('warn', message, metadata);
};

logger.info = (message, metadata = {}) => {
  logger.log('info', message, metadata);
};

logger.debug = (message, metadata = {}) => {
  logger.log('debug', message, metadata);
};

module.exports = logger;
