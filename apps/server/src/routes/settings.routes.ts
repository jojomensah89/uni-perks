import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db, siteSettings, eq } from "@uni-perks/db";
import { withKV } from "../lib/kv-cache";
import { withEdgeCache } from "../lib/edge-cache";

const app = new OpenAPIHono();

// Default ticker messages if not set in database
const DEFAULT_TICKER_MESSAGES = [
    "UNI-PERKS",
    "NO SIGNUP",
    "100% VERIFIED",
    "STUDENT DEALS",
    "NO BS",
];

const TickerMessagesSchema = z.object({
    messages: z.array(z.string()),
});

const getTickerRoute = createRoute({
    method: "get",
    path: "/ticker",
    tags: ["Settings"],
    summary: "Get Ticker Messages",
    description: "Get the site ticker messages for the scrolling banner.",
    responses: {
        200: {
            description: "Ticker messages",
            content: {
                "application/json": {
                    schema: TickerMessagesSchema,
                },
            },
        },
    },
});

app.openapi(getTickerRoute, async (c) => {
    const { data } = await withEdgeCache(c, 300, async () => {
        const messages = await withKV(
            (c.env as { KV?: KVNamespace }).KV,
            "settings:ticker",
            300,
            async () => {
                const result = await db
                    .select()
                    .from(siteSettings)
                    .where(eq(siteSettings.key, "ticker_messages"))
                    .limit(1);

                if (result[0]?.value) {
                    try {
                        return JSON.parse(result[0].value) as string[];
                    } catch {
                        return DEFAULT_TICKER_MESSAGES;
                    }
                }

                return DEFAULT_TICKER_MESSAGES;
            }
        );

        return { messages };
    });
    return c.json(data);
});

export default app;
