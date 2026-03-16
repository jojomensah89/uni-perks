import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  resolveDealRedirect,
  trackDealClick,
  trackDealClickEvent,
} from "../services/deal.service";
import { checkRateLimit, getClientIp } from "../lib/rate-limit";
import { logError } from "../lib/logger";
import { RATE_LIMITS } from "../lib/constants";
import { captureEvent } from "../lib/posthog";

const app = new OpenAPIHono();

const ClickSourceSchema = z.enum([
  "card",
  "detail",
  "featured",
  "collection",
  "newsletter",
  "comparison",
  "persona",
]);

function inferDevice(
  userAgent: string | null,
): "mobile" | "tablet" | "desktop" {
  if (!userAgent) return "desktop";
  const normalized = userAgent.toLowerCase();
  if (/ipad|tablet|kindle/.test(normalized)) return "tablet";
  if (/mobile|iphone|android/.test(normalized)) return "mobile";
  return "desktop";
}

const goRoute = createRoute({
  method: "get",
  path: "/{slug}",
  tags: ["Redirect"],
  summary: "Affiliate redirect",
  description:
    "Resolves country-aware destination URL, tracks click analytics, and redirects.",
  request: {
    params: z.object({
      slug: z.string(),
    }),
    query: z.object({
      src: ClickSourceSchema.optional(),
      country: z.string().length(2).optional(),
    }),
  },
  responses: {
    302: {
      description: "Redirected",
    },
    429: {
      description: "Too many requests",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});

app.openapi(goRoute, async (c) => {
  const ip = getClientIp(c);
  const rate = await checkRateLimit(
    c,
    `go:${ip}`,
    RATE_LIMITS.go.limit,
    RATE_LIMITS.go.windowSeconds,
  );
  c.header("X-RateLimit-Limit", String(rate.limit));
  c.header("X-RateLimit-Remaining", String(rate.remaining));
  c.header("X-RateLimit-Reset", String(rate.retryAfterSeconds));
  if (!rate.allowed) {
    c.header("Retry-After", String(rate.retryAfterSeconds));
    return c.json(
      { error: "Too many redirect attempts. Please try again shortly." },
      429,
    );
  }
  const { slug } = c.req.valid("param");
  const query = c.req.valid("query");
  const country = (query.country || c.req.header("cf-ipcountry") || "US").toUpperCase();
  const source = query.src || "detail";

  const { deal, destinationUrl } = await resolveDealRedirect(
    slug,
    country,
  );

  const appOrigin = (c.env as { CORS_ORIGIN?: string }).CORS_ORIGIN;
  const unavailablePath = `/deals/${slug}?unavailable=1`;
  const unavailableUrl = appOrigin
    ? new URL(unavailablePath, appOrigin).toString()
    : unavailablePath;

  if (!destinationUrl) {
    return c.redirect(unavailableUrl, 302);
  }

  const clickTracking = Promise.all([
    trackDealClick(deal.id),
    trackDealClickEvent({
      dealId: deal.id,
      brandId: deal.brandId,
      source,
      referrer: c.req.header("referer") ?? null,
      userAgent: c.req.header("user-agent") ?? null,
      device: inferDevice(c.req.header("user-agent") ?? null),
      country,
    }),
    captureEvent("deal_clicked", {
      deal_id: deal.id,
      deal_slug: deal.slug,
      brand_id: deal.brandId,
      source,
      country,
      referrer: c.req.header("referer") ?? null,
      device: inferDevice(c.req.header("user-agent") ?? null),
    }),
  ]).catch((error) => {
    logError("go-route", "failed to persist click analytics", {
      message: error instanceof Error ? error.message : String(error),
    });
  });

  if (c.executionCtx) {
    c.executionCtx.waitUntil(clickTracking);
  }

  return c.redirect(destinationUrl, 302);
});

export default app;
