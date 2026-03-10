import { auth } from "@uni-perks/auth";
import { env } from "@uni-perks/env/server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import geoRouter from "./routes/geo.routes";
import dealsRouter from "./routes/deals.routes";
import brandsRouter from "./routes/brands.routes";
import collectionsRouter from "./routes/collections.routes";
import categoriesRouter from "./routes/categories.routes";
import clicksRouter from "./routes/clicks.routes";

import adminRouter from "./routes/admin.routes";
import uploadRouter from "./routes/upload.routes";
import imagesRouter from "./routes/images.routes";
import settingsRouter from "./routes/settings.routes";
import tagsRouter from "./routes/tags.routes";
import goRouter from "./routes/go.routes";
import newsletterRouter from "./routes/newsletter.routes";
import { checkRateLimit, getClientIp } from "./lib/rate-limit";
import { verifyTurnstile } from "./lib/turnstile";

const app = new OpenAPIHono();

// Global error handler
app.onError(errorHandler);

// Middleware
app.use(logger());
app.use(secureHeaders());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);


const isDevelopment = process.env.NODE_ENV === "development";
// API Reference UI
// OpenAPI Spec
if (isDevelopment) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Uni-Perks API",
      description: "API for Uni-Perks student discount platform",
    },
  });
  app.get(
    "/reference",
    Scalar({
      spec: {
        url: "/doc",
      },
    } as any),
  );
}


// Auth routes
app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  if (c.req.method === "POST") {
    const pathname = new URL(c.req.url).pathname;
    const ip = getClientIp(c);
    const rate = await checkRateLimit(c, `auth:${ip}:${pathname}`, 20, 300);
    if (!rate.allowed) {
      c.header("Retry-After", String(rate.retryAfterSeconds));
      return c.json({ message: "Too many auth attempts. Please try again shortly." }, 429);
    }

    const requiresTurnstile = pathname.includes("/sign-in") || pathname.includes("/sign-up");
    if (requiresTurnstile) {
      const body = await c.req.raw.clone().json().catch(() => null) as Record<string, unknown> | null;
      const turnstileToken =
        body && typeof body.turnstileToken === "string"
          ? body.turnstileToken
          : null;
      const turnstileOk = await verifyTurnstile(c, turnstileToken);
      if (!turnstileOk) {
        return c.json({ message: "Turnstile verification failed" }, 400);
      }
    }
  }

  return auth.handler(c.req.raw);
});

// API routes
// All routes are now OpenAPIHono instances and will appear in the auto-generated spec
app.route("/api/geo", geoRouter);
app.route("/api/deals", dealsRouter);
app.route("/api/brands", brandsRouter);
app.route("/api/collections", collectionsRouter);
app.route("/api/categories", categoriesRouter);
app.route("/api/clicks", clicksRouter);

app.route("/api/admin", adminRouter);
app.route("/api/upload", uploadRouter);
app.route("/api/images", imagesRouter);
app.route("/api/settings", settingsRouter);
app.route("/api/tags", tagsRouter);
app.route("/api/newsletter", newsletterRouter);
app.route("/go", goRouter);

// Health check
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Uni-Perks API Running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler (must be last)
app.notFound(notFoundHandler);

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const { db, deals, sql } = await import("@uni-perks/db");
    const now = Date.now();

    const expired = await db
      .update(deals)
      .set({ isActive: false })
      .where(
        sql`${deals.expirationDate} IS NOT NULL
                    AND ${deals.expirationDate} < ${now}
                    AND ${deals.isActive} = 1`
      )
      .returning({ id: deals.id });

    console.log(`[cron] Expired ${expired.length} deals at ${new Date(now).toISOString()}`);
  },
};
