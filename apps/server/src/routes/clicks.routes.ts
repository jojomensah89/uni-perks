import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { trackDealClick, trackDealClickEvent } from "../services/deal.service";
import { BadRequestError } from "../lib/errors";
import { checkRateLimit, getClientIp } from "../lib/rate-limit";
import { captureEvent } from "../lib/posthog";

const app = new OpenAPIHono();

const trackClickRoute = createRoute({
    method: "post",
    path: "/{dealId}",
    tags: ["Clicks"],
    summary: "Track a click on a deal",
    description: "Increments the click count for a specific deal.",
    request: {
        params: z.object({
            dealId: z.string().openapi({
                param: {
                    name: "dealId",
                    in: "path",
                },
                example: "deal-123",
            }),
        }),
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        brandId: z.string().optional(),
                        categoryId: z.string().optional(),
                        collectionId: z.string().optional(),
                        source: z.string().optional(),
                        referrer: z.string().optional(),
                        device: z.string().optional(),
                        country: z.string().optional(),
                    }).optional(),
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                    }),
                },
            },
            description: "Click tracked successfully",
        },
        400: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: "Invalid request",
        },
        429: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: "Too many requests",
        },
    },
});

app.openapi(trackClickRoute, async (c) => {
    const ip = getClientIp(c);
    const rate = await checkRateLimit(c, `click:${ip}`, 20, 60);
    if (!rate.allowed) {
        c.header("Retry-After", String(rate.retryAfterSeconds));
        return c.json({ error: "Too many click attempts. Please try again shortly." }, 429);
    }
    const { dealId } = c.req.valid("param");
    const body = c.req.valid("json") || {};

    if (!dealId) {
        throw new BadRequestError("Deal ID is required");
    }

    const userAgent = c.req.header("user-agent") ?? null;
    const referrer = body.referrer ?? c.req.header("referer") ?? null;
    const country = body.country ?? c.req.header("cf-ipcountry") ?? null;
    const device = body.device ?? null;
    const source = body.source ?? "unknown";

    await trackDealClick(dealId);
    await trackDealClickEvent({
        dealId,
        brandId: body.brandId,
        source,
        referrer,
        userAgent,
        device,
        country,
    });
    await captureEvent("deal_clicked", {
        deal_id: dealId,
        brand_id: body.brandId,
        category_id: body.categoryId,
        collection_id: body.collectionId,
        source,
        referrer,
        country,
        device,
    });
    return c.json({ success: true }, 200);
});

export default app;
