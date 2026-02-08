import type { Context, Next } from "hono";
import { AppError } from "../lib/errors";

/**
 * Global error handling middleware
 */
export async function errorHandler(c: Context, next: Next) {
    try {
        await next();
    } catch (error) {
        console.error("Error:", error);

        // Handle known application errors
        if (error instanceof AppError) {
            return c.json(
                {
                    error: {
                        message: error.message,
                        statusCode: error.statusCode,
                        ...(error instanceof ValidationError && error.errors
                            ? { errors: error.errors }
                            : {}),
                    },
                },
                error.statusCode as any
            );
        }

        // Handle unknown errors
        const isDevelopment = process.env.NODE_ENV === "development";
        return c.json(
            {
                error: {
                    message: isDevelopment
                        ? (error as Error).message
                        : "Internal server error",
                    statusCode: 500,
                    ...(isDevelopment && { stack: (error as Error).stack }),
                },
            },
            500
        );
    }
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(c: Context) {
    return c.json(
        {
            error: {
                message: "Route not found",
                statusCode: 404,
                path: c.req.path,
            },
        },
        404
    );
}

// Import ValidationError for type checking
import { ValidationError } from "../lib/errors";
