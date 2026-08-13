/**
 * This module provides a logger utility using the Winston logging library.
 * @param module - The name of the module for which the logger is being created.
 * @returns A logger instance with the specified module name.
 * 
 * The logger is configured to log messages in JSON format, including timestamps and error stack traces.
 * The log level can be set using the LOG_LEVEL environment variable, and the service name and environment can be set using the SERVICE_NAME and NODE_ENV environment variables, respectively.
 * 
 * Example usage:
 * ```ts
 * import { createLogger } from "@/shared/utils/logger";
 * 
 * const authLogger = createLogger("auth");
 * 
 * authLogger.info("User authenticated", {
 *   userId,
 * });
 * ```
 * 
 */

import winston from "winston";

const isProduction = process.env.NODE_ENV === "production";

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, {
      message: info.message,
      stack: info.stack,
    });
  }

  if (info.error instanceof Error) {
    info.error = {
      name: info.error.name,
      message: info.error.message,
      stack: info.error.stack,
    };
  }

  return info;
});

const logger = winston.createLogger({
  level:
    process.env.LOG_LEVEL ??
    (isProduction ? "info" : "debug"),

  format: winston.format.combine(
    enumerateErrorFormat(),
    winston.format.timestamp(),
    winston.format.errors({
      stack: true,
    }),
    winston.format.json(),
  ),

  defaultMeta: {
    service: process.env.SERVICE_NAME ?? "crm-api",
    environment: process.env.NODE_ENV ?? "development",
  },

  transports: [
    new winston.transports.Console(),
  ],

  exitOnError: false,
});

const createLogger = (module: string) => {
  return logger.child({
    module,
  });
};

export {
  logger,
  createLogger,
};

export default logger;