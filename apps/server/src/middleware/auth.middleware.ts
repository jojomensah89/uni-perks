import type { Context } from "hono";
import { auth } from "@uni-perks/auth";
import { UnauthorizedError } from "../lib/errors";

/**
 * Middleware to require authentication
 * Verifies that the user has a valid session
 */
export async function requireAuth(c: Context, next: () => Promise<void>) {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!session?.user) {
        throw new UnauthorizedError("Authentication required");
    }

    // Attach user to context for downstream use
    c.set("user", session.user);
    c.set("session", session);

    await next();
}

/**
 * Middleware to require admin role
 * Must be used after requireAuth
 */
export async function requireAdmin(c: Context, next: () => Promise<void>) {
    const user = c.get("user");

    if (!user) {
        throw new UnauthorizedError("Authentication required");
    }

    if (user.role !== "admin") {
        throw new UnauthorizedError("Admin access required");
    }

    await next();
}
