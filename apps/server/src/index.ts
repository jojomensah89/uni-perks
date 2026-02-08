import { auth } from "@uni-perks/auth";
import { env } from "@uni-perks/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import geoRouter from "./routes/geo.routes";
import perksRouter from "./routes/perks.routes";
import categoriesRouter from "./routes/categories.routes";
import clicksRouter from "./routes/clicks.routes";
import seedRouter from "./routes/seed.routes";

const app = new Hono();

// Global error handler (must be first)
app.use("*", errorHandler);

// Middleware
app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Auth routes
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// API routes
app.route("/api/geo", geoRouter);
app.route("/api/perks", perksRouter);
app.route("/api/categories", categoriesRouter);
app.route("/api/clicks", clicksRouter);
app.route("/api/seed", seedRouter);

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
