import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { trackDealClick } from "../services/deal.service";
import { BadRequestError } from "../lib/errors";
import { checkRateLimit, getClientIp } from "../lib/rate-limit";

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
                        message: z.string(),
                    }),
                },
            },
            description: "Invalid request",
        },
        429: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
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
        return c.json({ message: "Too many click attempts. Please try again shortly." }, 429);
    }
    const { dealId } = c.req.valid("param");

    if (!dealId) {
        throw new BadRequestError("Deal ID is required");
    }

    await trackDealClick(dealId);
    return c.json({ success: true }, 200);
});

export default app;
