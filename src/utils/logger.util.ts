import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, colorize, errors } = format;

// Custom log format
const customFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create the logger
const logger = createLogger({
  level: "info", // Default log level
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), 
    errors({ stack: true }), // Format errors to include stack traces
    customFormat
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), customFormat), // Colorized output for the console
    }),
    new transports.File({ filename: "logs/error.log", level: "error" }), // Error logs
    new transports.File({ filename: "logs/combined.log" }), // All logs
  ],
  exitOnError: false,
});

// Handle uncaught exceptions and rejections
logger.exceptions.handle(
  new transports.File({ filename: "logs/exceptions.log" })
);
logger.rejections.handle(
  new transports.File({ filename: "logs/rejections.log" })
);

export default logger;
