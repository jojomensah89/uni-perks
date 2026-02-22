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
            {
                error: {
                    message: appError.message,
                    statusCode: appError.statusCode,
                    ...(appError.errors ? { errors: appError.errors } : {}),
                },
            },
            appError.statusCode as any
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

