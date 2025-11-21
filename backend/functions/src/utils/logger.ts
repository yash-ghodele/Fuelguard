import * as winston from 'winston';
import * as functions from 'firebase-functions';

// Create Winston logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
    ],
});

/**
 * Structured logging utility for Cloud Functions
 */
export class Logger {
    private context: string;

    constructor(context: string) {
        this.context = context;
    }

    info(message: string, meta?: Record<string, unknown>) {
        logger.info(message, { context: this.context, ...meta });
        functions.logger.info(message, { context: this.context, ...meta });
    }

    warn(message: string, meta?: Record<string, unknown>) {
        logger.warn(message, { context: this.context, ...meta });
        functions.logger.warn(message, { context: this.context, ...meta });
    }

    error(message: string, error?: Error, meta?: Record<string, unknown>) {
        logger.error(message, {
            context: this.context,
            error: error?.message,
            stack: error?.stack,
            ...meta,
        });
        functions.logger.error(message, {
            context: this.context,
            error: error?.message,
            stack: error?.stack,
            ...meta,
        });
    }

    debug(message: string, meta?: Record<string, unknown>) {
        logger.debug(message, { context: this.context, ...meta });
        functions.logger.debug(message, { context: this.context, ...meta });
    }
}

/**
 * Create logger instance for a specific context
 */
export function createLogger(context: string): Logger {
    return new Logger(context);
}

/**
 * Log API request/response
 */
export function logRequest(
    method: string,
    path: string,
    userId?: string,
    duration?: number
) {
    logger.info('API Request', {
        method,
        path,
        userId,
        duration,
    });
}

/**
 * Log performance metrics
 */
export function logPerformance(
    operation: string,
    duration: number,
    meta?: Record<string, unknown>
) {
    logger.info('Performance', {
        operation,
        duration,
        ...meta,
    });
}
