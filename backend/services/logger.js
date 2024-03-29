const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");
const fs = require("fs");
const path = require("path");

const env = process.env.NODE_ENV || "development";
const logDir = path.join(__dirname, "log");
const datePatternConfiguration = {
  default: "YYYY-MM-DD",
  everHour: "YYYY-MM-DD-HH",
  everMinute: "YYYY-MM-DD-THH-mm",
};
const numberOfDaysToKeepLog = 30;
const fileSizeToRotate = 2; // in megabyte

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

const logger = createLogger({
  // change level if in dev environment versus production
  level: env === "development" ? "verbose" : "info",
  handleExceptions: true,
  format: format.combine(
    format.label({ label: path.basename(module.parent.filename) }),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.printf(
      (info) =>
        `${info.timestamp}[${info.label}] ${info.level}: ${JSON.stringify(
          info.message
        )}`
    )
  ),
  transports: [
    new transports.Console({
      level: "info",
      handleExceptions: true,
      format: format.combine(
        format.label({ label: path.basename(module.parent.filename) }),
        format.colorize(),
        format.printf(
          (info) =>
            `${info.timestamp}[${info.label}] ${info.level}: ${info.message}`
        )
      ),
    }),
    dailyRotateFileTransport,
  ],
});

logger.stream = {
  write: (message) => {
    logger.info(message);
  },
};

logger.error = (message, trace = "", context = "") => {
  logger.error({ message, trace, context });
};

logger.warn = (message) => {
  logger.warn({ message });
};

logger.debug = (message) => {
  logger.debug({ message });
};

module.exports = logger;
