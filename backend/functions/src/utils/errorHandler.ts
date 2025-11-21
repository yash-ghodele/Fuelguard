import { Request, Response } from "firebase-functions";
import { createLogger } from "./logger";

const logger = createLogger("ErrorHandler");

/**
 * Centralized error handling middleware
 */
export function handleError(error: unknown, req: Request, res: Response) {
    if (error instanceof Error) {
        logger.error("Request error", error, {
            method: req.method,
            path: req.path,
            userId: (req as any).user?.uid,
        });

        // Check for specific error types
        if (error.name === "UnauthorizedError") {
            res.status(401).json({
                error: "Unauthorized",
                message: "Invalid or missing authentication token",
            });
            return;
        }

        if (error.name === "ValidationError") {
            res.status(400).json({
                error: "Validation Error",
                message: error.message,
            });
            return;
        }

        if (error.name === "NotFoundError") {
            res.status(404).json({
                error: "Not Found",
                message: error.message,
            });
            return;
        }

        // Generic server error
        res.status(500).json({
            error: "Internal Server Error",
            message: process.env.NODE_ENV === "production" ?
                "An error occurred" :
                error.message,
        });
    } else {
        logger.error("Unknown error", new Error(String(error)));
        res.status(500).json({
            error: "Internal Server Error",
            message: "An unexpected error occurred",
        });
    }
}

/**
 * Async handler wrapper to catch errors
 */
export function asyncHandler(
    fn: (req: Request, res: Response) => Promise<void>
) {
    return async (req: Request, res: Response) => {
        try {
            await fn(req, res);
        } catch (error) {
            handleError(error, req, res);
        }
    };
}
