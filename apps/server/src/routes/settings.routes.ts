import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db, siteSettings, eq } from "@uni-perks/db";

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
    const result = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, "ticker_messages"))
        .limit(1);

    if (result[0]?.value) {
        try {
            const messages = JSON.parse(result[0].value);
            return c.json({ messages }, 200);
        } catch {
            // If parsing fails, return default
        }
    }

    return c.json({ messages: DEFAULT_TICKER_MESSAGES }, 200);
});

export default app;
