import type { Context } from "hono";

/**
 * Global error handling middleware
 */
export async function errorHandler(error: Error, c: Context) {
    console.error("Error:", error);

    // Handle known application errors (duck-typing to avoid module/instanceof issues)
    const appError = error as any;
    if (appError && typeof appError.statusCode === 'number' && appError.isOperational !== undefined) {
        return c.json(
            { error: appError.message },
            appError.statusCode as any
        );
    }

    // Handle unknown errors
    const isDevelopment = process.env.NODE_ENV === "development";
    return c.json(
        {
            error: isDevelopment
                ? (error as Error).message
                : "Internal server error"
        },
        500
    );
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(c: Context) {
    return c.json(
        { error: "Route not found" },
        404
    );
}

