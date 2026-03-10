import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getGeoData } from "../services/geo.service";
import { resolveDealRedirect, trackDealClick, trackDealClickEvent } from "../services/deal.service";
import { checkRateLimit, getClientIp } from "../lib/rate-limit";

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

function inferDevice(userAgent: string | null): "mobile" | "tablet" | "desktop" {
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
    description: "Resolves country-aware destination URL, tracks click analytics, and redirects.",
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
    const rate = await checkRateLimit(c, `go:${ip}`, 20, 60);
    if (!rate.allowed) {
        c.header("Retry-After", String(rate.retryAfterSeconds));
        return c.json({ error: "Too many redirect attempts. Please try again shortly." }, 429);
    }
    const { slug } = c.req.valid("param");
    const query = c.req.valid("query");
    const geoData = getGeoData(c.req.raw);
    const country = (query.country || geoData.country || "US").toUpperCase();
    const source = query.src || "detail";

    const { deal, destinationUrl, isAvailable } = await resolveDealRedirect(slug, country);

    const appOrigin = (c.env as { CORS_ORIGIN?: string }).CORS_ORIGIN;
    const unavailablePath = `/deals/${slug}?unavailable=1`;
    const unavailableUrl = appOrigin ? new URL(unavailablePath, appOrigin).toString() : unavailablePath;

    if (!isAvailable || !destinationUrl) {
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
            regionCode: geoData.region || null,
            city: geoData.city || null,
        }),
    ]).catch((error) => {
        console.error("Failed to persist click analytics from /go redirect:", error);
    });

    if (c.executionCtx) {
        c.executionCtx.waitUntil(clickTracking);
    }

    return c.redirect(destinationUrl, 302);
});

export default app;
