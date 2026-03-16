import type { Context } from "hono";
import { logError } from "../lib/logger";

const JSON_STATUS_CODES = [400, 401, 403, 404, 409, 422, 429, 500] as const;
type JsonStatusCode = (typeof JSON_STATUS_CODES)[number];

/**
 * Global error handling middleware
 */
export async function errorHandler(error: Error, c: Context) {
  logError("error-handler", "request failed", {
    path: c.req.path,
    method: c.req.method,
    errorName: error.name,
    errorMessage: error.message,
  });

  const maybeAppError = error as Partial<{
    statusCode: number;
    isOperational: boolean;
    message: string;
  }>;

  if (
    typeof maybeAppError.statusCode === "number" &&
    typeof maybeAppError.isOperational === "boolean"
  ) {
    const statusCode = JSON_STATUS_CODES.includes(
      maybeAppError.statusCode as JsonStatusCode,
    )
      ? (maybeAppError.statusCode as JsonStatusCode)
      : 500;
    return c.json(
      { error: maybeAppError.message ?? "Request failed" },
      statusCode,
    );
  }

  const isDevelopment = process.env.NODE_ENV === "development";
  const message = isDevelopment
    ? error.message
    : "Something went wrong. Please try again.";

  return c.json({ error: message }, 500);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(c: Context) {
  return c.json({ error: "Route not found" }, 404);
}
