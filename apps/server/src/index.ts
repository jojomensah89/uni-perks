import { auth } from "@uni-perks/auth";
import { env } from "@uni-perks/env/server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { db, deals, sql } from "@uni-perks/db";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import dealsRouter from "./routes/deals.routes";
import brandsRouter from "./routes/brands.routes";
import collectionsRouter from "./routes/collections.routes";
import categoriesRouter from "./routes/categories.routes";
import clicksRouter from "./routes/clicks.routes";

import adminRouter from "./routes/admin.main.routes";
import uploadRouter from "./routes/upload.routes";
import imagesRouter from "./routes/images.routes";
import settingsRouter from "./routes/settings.routes";
import goRouter from "./routes/go.routes";
import newsletterRouter from "./routes/newsletter.routes";
import newsletterSendRouter from "./routes/newsletter/send.routes";
import { checkRateLimit, getClientIp, setRateLimitHeaders } from "./lib/rate-limit";
import { verifyTurnstile } from "./lib/turnstile";
import { logError, logInfo } from "./lib/logger";
import { API_MESSAGES, RATE_LIMITS } from "./lib/constants";

type WorkerEnv = {
  KV?: KVNamespace;
  CORS_ORIGIN?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
};

const app = new OpenAPIHono();

// Global error handler
app.onError(errorHandler);

// Middleware
app.use(logger());
app.use(
  secureHeaders({
    crossOriginResourcePolicy: "cross-origin",
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  }),
);

// API Reference UI
// OpenAPI Spec
// if (isDevelopment) {
app.doc("/api/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Uni-Perks API",
    description: "API for Uni-Perks student discount platform",
  },
});

app.get(
  "/api/reference",
  Scalar({
    spec: {
      url: "/api/doc",
    },
  } as any),
);
// }
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Auth routes
app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const pathname = new URL(c.req.url).pathname;
  const method = c.req.method;
  const ip = getClientIp(c);
  const kv = (c.env as WorkerEnv).KV;
  const isSignIn = pathname.includes("/sign-in");
  let authBody: Record<string, unknown> | null = null;

  if (method === "POST") {
    authBody = (await c.req.raw
      .clone()
      .json()
      .catch(() => null)) as Record<string, unknown> | null;
  }

  if (isSignIn && kv && method === "POST") {
    const email =
      authBody && typeof authBody.email === "string"
        ? authBody.email.toLowerCase().trim()
        : null;
    const identityKey = email ? `email:${email}` : `ip:${ip}`;
    const lockoutKey = `auth:lockout:${identityKey}`;
    const lockedUntilRaw = await kv.get(lockoutKey);
    const lockedUntil = lockedUntilRaw
      ? Number.parseInt(lockedUntilRaw, 10)
      : 0;
    if (lockedUntil > Date.now()) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((lockedUntil - Date.now()) / 1000),
      );
      c.header("Retry-After", String(retryAfterSeconds));
      return c.json(
        {
          message: API_MESSAGES.accountLocked,
        },
        429,
      );
    }
  }

  if (c.req.method === "POST") {
    const rate = await checkRateLimit(
      c,
      `auth:${ip}:${pathname}`,
      RATE_LIMITS.auth.limit,
      RATE_LIMITS.auth.windowSeconds,
    );
    setRateLimitHeaders(c, rate.limit, rate.remaining, rate.retryAfterSeconds);
    if (!rate.allowed) {
      c.header("Retry-After", String(rate.retryAfterSeconds));
      return c.json({ message: API_MESSAGES.tooManyAuthAttempts }, 429);
    }

    const requiresTurnstile =
      pathname.includes("/sign-in") || pathname.includes("/sign-up");
    if (requiresTurnstile) {
      const turnstileToken =
        authBody && typeof authBody.turnstileToken === "string"
          ? authBody.turnstileToken
          : null;
      const turnstileOk = await verifyTurnstile(c, turnstileToken);
      if (!turnstileOk) {
        return c.json({ message: API_MESSAGES.turnstileFailed }, 400);
      }
    }
  }

  const authResponse = await auth.handler(c.req.raw);

  if (kv && isSignIn && method === "POST") {
    const email =
      authBody && typeof authBody.email === "string"
        ? authBody.email.toLowerCase().trim()
        : null;
    const identityKey = email ? `email:${email}` : `ip:${ip}`;
    const lockoutKey = `auth:lockout:${identityKey}`;
    const attemptsKey = `auth:attempts:${identityKey}`;
    const lockoutWindowSeconds = RATE_LIMITS.signInLockout.windowSeconds;

    if (authResponse.ok) {
      await Promise.all([kv.delete(attemptsKey), kv.delete(lockoutKey)]);
    } else {
      const attempts =
        Number.parseInt((await kv.get(attemptsKey)) ?? "0", 10) + 1;
      if (attempts >= RATE_LIMITS.signInLockout.maxAttempts) {
        const lockedUntil = Date.now() + lockoutWindowSeconds * 1000;
        await Promise.all([
          kv.put(lockoutKey, String(lockedUntil), {
            expirationTtl: lockoutWindowSeconds,
          }),
          kv.delete(attemptsKey),
        ]);
      } else {
        await kv.put(attemptsKey, String(attempts), {
          expirationTtl: lockoutWindowSeconds,
        });
      }
    }
  }

  return authResponse;
});

// API routes
app.route("/api/deals", dealsRouter);
app.route("/api/brands", brandsRouter);
app.route("/api/collections", collectionsRouter);
app.route("/api/categories", categoriesRouter);
app.route("/api/clicks", clicksRouter);

app.route("/api/admin", adminRouter);
app.route("/api/upload", uploadRouter);
app.route("/api/images", imagesRouter);
app.route("/api/settings", settingsRouter);
app.route("/api/newsletter", newsletterRouter);
app.route("/api/newsletter/send", newsletterSendRouter);
app.route("/go", goRouter);

// Health check
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: API_MESSAGES.healthOk,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler (must be last)
app.notFound(notFoundHandler);

export default {
  fetch: app.fetch,

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const now = Date.now();

    const expired = await db
      .update(deals)
      .set({ status: "archived" })
      .where(
        sql`${deals.expiresAt} IS NOT NULL
          AND ${deals.expiresAt} < ${now}
          AND ${deals.status} = 'published'`,
      )
      .returning({ id: deals.id });

    logInfo("cron", "expired stale deals", {
      expiredCount: expired.length,
      executedAt: new Date(now).toISOString(),
    });

    if (expired.length > 0) {
      const kv = (env as WorkerEnv).KV;
      if (kv) {
        ctx.waitUntil(
          kv.delete("deals:featured").catch((error) => {
            const message =
              error instanceof Error ? error.message : String(error);
            logError("cron", "failed to invalidate deals:featured cache", {
              message,
            });
          }),
        );
      }
    }
  },
};
