import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { sendWeeklyNewsletter, type NewsletterConfig } from "../../lib/newsletter-agent";
import { logInfo, logError } from "../../lib/logger";

const app = new OpenAPIHono();

type WorkerEnv = {
    RESEND_API_KEY?: string;
    RESEND_FROM_EMAIL?: string;
    NEXT_PUBLIC_BASE_URL?: string;
    BETTER_AUTH_SECRET?: string;
    NEWSLETTER_ENABLED?: string;
    NEWSLETTER_DEAL_COUNT?: string;
    NEWSLETTER_HOTNESS_THRESHOLD?: string;
};

function getAppOrigin(env: WorkerEnv): string {
    return env.NEXT_PUBLIC_BASE_URL ?? "https://uni-perks.com";
}

function getSigningSecret(env: WorkerEnv): string {
    return env.BETTER_AUTH_SECRET ?? "dev-newsletter-secret";
}

const triggerNewsletterRoute = createRoute({
    method: "post",
    path: "/send",
    tags: ["Newsletter", "Admin"],
    summary: "Trigger weekly newsletter send",
    description: "Sends the weekly newsletter to all verified subscribers. Can be triggered manually or via cron.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        dealCount: z.number().min(1).max(50).optional(),
                        hotnessThreshold: z.number().min(0).max(100).optional(),
                        forceSend: z.boolean().optional(),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: "Newsletter send result",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                        dealCount: z.number(),
                        subscriberCount: z.number(),
                        sent: z.number(),
                        failed: z.number(),
                        errors: z.array(z.string()),
                    }),
                },
            },
        },
        400: {
            description: "Newsletter disabled or no content",
            content: {
                "application/json": {
                    schema: z.object({ error: z.string() }),
                },
            },
        },
    },
});

app.openapi(triggerNewsletterRoute, async (c) => {
    const env = c.env as WorkerEnv;
    const body = c.req.valid("json");

    if (env.NEWSLETTER_ENABLED === "false") {
        return c.json({ error: "Newsletter is disabled" }, 400);
    }

    const config: NewsletterConfig = {
        apiKey: env.RESEND_API_KEY ?? "",
        fromEmail: env.RESEND_FROM_EMAIL ?? "UniPerks <deals@uni-perks.com>",
        appOrigin: getAppOrigin(env),
        signingSecret: getSigningSecret(env),
        dealCount: body.dealCount ?? parseInt(env.NEWSLETTER_DEAL_COUNT ?? "15", 10),
        hotnessThreshold: body.hotnessThreshold ?? parseInt(env.NEWSLETTER_HOTNESS_THRESHOLD ?? "50", 10),
    };

    if (!config.apiKey) {
        logError("newsletter-send", "RESEND_API_KEY not configured");
        return c.json({ error: "Email service not configured" }, 400);
    }

    logInfo("newsletter-send", "Starting newsletter send", {
        dealCount: config.dealCount,
        hotnessThreshold: config.hotnessThreshold,
    });

    const result = await sendWeeklyNewsletter(config);

    return c.json(result, 200);
});

export default app;
