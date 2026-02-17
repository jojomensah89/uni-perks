import { auth } from "@uni-perks/auth";
import { env } from "@uni-perks/env/server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import geoRouter from "./routes/geo.routes";
import dealsRouter from "./routes/deals.routes";
import brandsRouter from "./routes/brands.routes";
import collectionsRouter from "./routes/collections.routes";
import categoriesRouter from "./routes/categories.routes";
import clicksRouter from "./routes/clicks.routes";
import suggestionsRouter from "./routes/suggestions.routes";
import seedRouter from "./routes/seed.routes";
import adminRouter from "./routes/admin.routes";

const app = new OpenAPIHono();

// Global error handler (must be first)
app.use("*", errorHandler);

// Middleware
app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// OpenAPI Spec
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Uni-Perks API",
    description: "API for Uni-Perks student discount platform",
  },
});

// API Reference UI
app.get(
  "/reference",
  apiReference({
    spec: {
      url: "/doc",
    },
  } as any),
);

// Auth routes
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// API routes
// All routes are now OpenAPIHono instances and will appear in the auto-generated spec
app.route("/api/geo", geoRouter);
app.route("/api/deals", dealsRouter);
app.route("/api/brands", brandsRouter);
app.route("/api/collections", collectionsRouter);
app.route("/api/categories", categoriesRouter);
app.route("/api/clicks", clicksRouter);
app.route("/api/suggestions", suggestionsRouter);
app.route("/api/seed", seedRouter);
app.route("/api/admin", adminRouter);

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

export default app;
