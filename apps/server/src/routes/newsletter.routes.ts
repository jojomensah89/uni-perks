import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
    and,
    brands,
    db,
    deals,
    desc,
    eq,
    inArray,
    isNull,
    siteSettings,
    subscribers,
} from "@uni-perks/db";
import { createElement } from "react";

import { WeeklyDigestEmail } from "../emails/weekly-digest";
import { VerifySubscriptionEmail } from "../emails/verify-subscription";
import { sendEmail } from "../lib/email";
import { BadRequestError } from "../lib/errors";
import { checkRateLimit, getClientIp } from "../lib/rate-limit";
import { verifyTurnstile } from "../lib/turnstile";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";

const app = new OpenAPIHono();
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const SubscribeRequestSchema = z.object({
    email: z.string().email(),
    source: z.string().max(100).optional(),
    turnstileToken: z.string().optional(),
});

const UnsubscribeRequestSchema = z.object({
    token: z.string().optional(),
    email: z.string().email().optional(),
});

const NewsletterDraftSchema = z.object({
    subject: z.string().min(3).max(150),
    introText: z.string().max(1200).optional().nullable(),
    dealIds: z.array(z.string()).min(1).max(50),
});

const NewsletterPreviewRequestSchema = NewsletterDraftSchema.extend({
    previewEmail: z.string().email(),
});

const NewsletterDealSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    discountLabel: z.string(),
    shortDescription: z.string(),
    brandName: z.string(),
});

const NewsletterDraftResponseSchema = z.object({
    subject: z.string(),
    introText: z.string().nullable(),
    dealIds: z.array(z.string()),
});

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function toBase64Url(bytes: Uint8Array): string {
    const binary = Array.from(bytes).map((byte) => String.fromCharCode(byte)).join("");
    return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(base64Url: string): Uint8Array {
    const normalized = base64Url.replaceAll("-", "+").replaceAll("_", "/");
    const paddingLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + "=".repeat(paddingLength);
    const decoded = atob(padded);
    return Uint8Array.from(decoded, (char) => char.charCodeAt(0));
}

async function signValue(secret: string, value: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );
    const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
    return toBase64Url(signature);
}

async function createSignedEmailToken(secret: string, email: string): Promise<string> {
    const payload = toBase64Url(encoder.encode(normalizeEmail(email)));
    const signature = await signValue(secret, payload);
    return `${payload}.${signature}`;
}

async function readSignedEmailToken(secret: string, token: string): Promise<string | null> {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) {
        return null;
    }

    const expectedSignature = await signValue(secret, payload);
    if (signature !== expectedSignature) {
        return null;
    }

    try {
        const payloadBytes = fromBase64Url(payload);
        return normalizeEmail(decoder.decode(payloadBytes));
    } catch {
        return null;
    }
}

function getAppOrigin(c: { env: unknown; req: { url: string } }): string {
    const env = c.env as { NEXT_PUBLIC_BASE_URL?: string; CORS_ORIGIN?: string };
    return env.NEXT_PUBLIC_BASE_URL ?? env.CORS_ORIGIN ?? new URL(c.req.url).origin;
}

function getSigningSecret(c: { env: unknown }): string {
    const env = c.env as { BETTER_AUTH_SECRET?: string };
    return env.BETTER_AUTH_SECRET ?? "dev-newsletter-secret";
}

function getEmailConfig(c: { env: unknown }): { apiKey?: string; fromEmail?: string } {
    const env = c.env as { RESEND_API_KEY?: string; RESEND_FROM_EMAIL?: string };
    return {
        apiKey: env.RESEND_API_KEY,
        fromEmail: env.RESEND_FROM_EMAIL ?? "UniPerks <deals@uni-perks.com>",
    };
}

async function saveNewsletterDraft(draft: z.infer<typeof NewsletterDraftSchema>) {
    const value = JSON.stringify({
        subject: draft.subject,
        introText: draft.introText ?? null,
        dealIds: [...new Set(draft.dealIds)],
        updatedAt: new Date().toISOString(),
    });

    const existing = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, "newsletter:draft"))
        .limit(1);

    if (!existing[0]) {
        await db.insert(siteSettings).values({
            key: "newsletter:draft",
            value,
            description: "Draft payload for admin newsletter compose flow",
        });
        return;
    }

    await db
        .update(siteSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteSettings.id, existing[0].id));
}

async function readNewsletterDraft(): Promise<z.infer<typeof NewsletterDraftResponseSchema> | null> {
    const existing = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, "newsletter:draft"))
        .limit(1);

    const rawValue = existing[0]?.value;
    if (!rawValue) {
        return null;
    }

    try {
        const parsed = JSON.parse(rawValue) as {
            subject?: unknown;
            introText?: unknown;
            dealIds?: unknown;
        };
        const validated = NewsletterDraftResponseSchema.safeParse({
            subject: parsed.subject,
            introText: parsed.introText ?? null,
            dealIds: parsed.dealIds,
        });
        return validated.success ? validated.data : null;
    } catch {
        return null;
    }
}

async function resolveNewsletterDeals(dealIds: string[]): Promise<z.infer<typeof NewsletterDealSchema>[]> {
    const uniqueDealIds = [...new Set(dealIds)];
    if (uniqueDealIds.length === 0) {
        return [];
    }

    const rows = await db
        .select({
            id: deals.id,
            slug: deals.slug,
            title: deals.title,
            discountLabel: deals.discountLabel,
            shortDescription: deals.shortDescription,
            brandName: brands.name,
        })
        .from(deals)
        .innerJoin(brands, eq(deals.brandId, brands.id))
        .where(and(inArray(deals.id, uniqueDealIds), eq(deals.isActive, true)));

    const byId = new Map(rows.map((row) => [row.id, row]));
    return uniqueDealIds
        .map((dealId) => byId.get(dealId))
        .filter((row): row is typeof rows[number] => Boolean(row))
        .map((row) => ({
            id: row.id,
            slug: row.slug,
            title: row.title,
            discountLabel: row.discountLabel,
            shortDescription: row.shortDescription ?? "",
            brandName: row.brandName,
        }));
}

const subscribeRoute = createRoute({
    method: "post",
    path: "/subscribe",
    tags: ["Newsletter"],
    summary: "Subscribe to newsletter",
    description: "Creates or refreshes a newsletter subscription and sends verification email.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: SubscribeRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Subscription accepted",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                        requiresVerification: z.boolean(),
                        alreadySubscribed: z.boolean().optional(),
                    }),
                },
            },
        },
        400: {
            description: "Invalid request",
            content: {
                "application/json": {
                    schema: z.object({ error: z.string() }),
                },
            },
        },
        429: {
            description: "Rate limited",
            content: {
                "application/json": {
                    schema: z.object({ error: z.string() }),
                },
            },
        },
    },
});

app.openapi(subscribeRoute, async (c) => {
    const body = c.req.valid("json");
    const email = normalizeEmail(body.email);
    const ip = getClientIp(c);

    const rate = await checkRateLimit(c, `newsletter:subscribe:${ip}`, 3, 600);
    if (!rate.allowed) {
        c.header("Retry-After", String(rate.retryAfterSeconds));
        return c.json({ error: "Too many subscription attempts. Please try again later." }, 429);
    }

    const turnstileOk = await verifyTurnstile(c, body.turnstileToken ?? null);
    if (!turnstileOk) {
        throw new BadRequestError("Turnstile verification failed");
    }

    const existing = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, email))
        .limit(1);

    if (existing[0]?.isVerified && !existing[0].unsubscribedAt) {
        return c.json({ success: true, requiresVerification: false, alreadySubscribed: true }, 200);
    }

    const verificationToken = crypto.randomUUID().replaceAll("-", "");
    const source = body.source ?? existing[0]?.source ?? "website";
    const country = c.req.header("cf-ipcountry") ?? existing[0]?.country ?? null;
    const now = new Date();

    if (!existing[0]) {
        await db.insert(subscribers).values({
            email,
            source,
            isVerified: false,
            verificationToken,
            subscribedAt: now,
            unsubscribedAt: null,
            country,
        });
    } else {
        await db
            .update(subscribers)
            .set({
                source,
                isVerified: false,
                verificationToken,
                verifiedAt: null,
                subscribedAt: now,
                unsubscribedAt: null,
                country,
            })
            .where(eq(subscribers.id, existing[0].id));
    }

    const appOrigin = getAppOrigin(c);
    const signingSecret = getSigningSecret(c);
    const unsubscribeToken = await createSignedEmailToken(signingSecret, email);
    const verificationUrl = new URL(`/api/subscribe/verify?token=${encodeURIComponent(verificationToken)}`, appOrigin).toString();
    const unsubscribeUrl = new URL(`/api/subscribe/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`, appOrigin).toString();

    const emailConfig = getEmailConfig(c);
    await sendEmail({
        apiKey: emailConfig.apiKey,
        fromEmail: emailConfig.fromEmail,
        to: email,
        subject: "Confirm your UniPerks newsletter subscription",
        react: createElement(VerifySubscriptionEmail, {
            verificationUrl,
            unsubscribeUrl,
            recipientEmail: email,
        }),
    });

    return c.json({ success: true, requiresVerification: true }, 200);
});

const verifyRoute = createRoute({
    method: "get",
    path: "/subscribe/verify",
    tags: ["Newsletter"],
    summary: "Verify newsletter subscription",
    description: "Validates verification token and marks subscriber as verified.",
    request: {
        query: z.object({
            token: z.string().min(10),
        }),
    },
    responses: {
        302: {
            description: "Redirect to site confirmation state",
        },
    },
});

app.openapi(verifyRoute, async (c) => {
    const { token } = c.req.valid("query");
    const appOrigin = getAppOrigin(c);

    const matched = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.verificationToken, token))
        .limit(1);

    if (!matched[0]) {
        return c.redirect(new URL("/?newsletter=invalid", appOrigin).toString(), 302);
    }

    await db
        .update(subscribers)
        .set({
            isVerified: true,
            verifiedAt: new Date(),
            verificationToken: null,
            unsubscribedAt: null,
        })
        .where(eq(subscribers.id, matched[0].id));

    return c.redirect(new URL("/?newsletter=verified", appOrigin).toString(), 302);
});

const unsubscribeQueryRoute = createRoute({
    method: "get",
    path: "/subscribe/unsubscribe",
    tags: ["Newsletter"],
    summary: "Unsubscribe via query token",
    description: "Unsubscribes a user using a signed token query parameter.",
    request: {
        query: z.object({
            token: z.string().optional(),
            email: z.string().email().optional(),
        }),
    },
    responses: {
        302: {
            description: "Redirect to unsubscribe confirmation state",
        },
    },
});

app.openapi(unsubscribeQueryRoute, async (c) => {
    const query = c.req.valid("query");
    const signingSecret = getSigningSecret(c);
    const appOrigin = getAppOrigin(c);

    let email: string | null = null;
    if (query.token) {
        email = await readSignedEmailToken(signingSecret, query.token);
    } else if (query.email) {
        email = normalizeEmail(query.email);
    }

    if (!email) {
        return c.redirect(new URL("/?newsletter=invalid", appOrigin).toString(), 302);
    }

    await db
        .update(subscribers)
        .set({
            unsubscribedAt: new Date(),
            isVerified: false,
            verificationToken: null,
        })
        .where(eq(subscribers.email, email));

    return c.redirect(new URL("/?newsletter=unsubscribed", appOrigin).toString(), 302);
});

const unsubscribeRoute = createRoute({
    method: "post",
    path: "/subscribe/unsubscribe",
    tags: ["Newsletter"],
    summary: "Unsubscribe from newsletter",
    description: "Unsubscribes a user by signed token (or email fallback).",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: UnsubscribeRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Unsubscribed",
            content: {
                "application/json": {
                    schema: z.object({ success: z.boolean() }),
                },
            },
        },
        400: {
            description: "Invalid token or payload",
            content: {
                "application/json": {
                    schema: z.object({ error: z.string() }),
                },
            },
        },
    },
});

app.openapi(unsubscribeRoute, async (c) => {
    const body = c.req.valid("json");
    const signingSecret = getSigningSecret(c);

    let email: string | null = null;
    if (body.token) {
        email = await readSignedEmailToken(signingSecret, body.token);
    } else if (body.email) {
        email = normalizeEmail(body.email);
    }

    if (!email) {
        throw new BadRequestError("Invalid unsubscribe token");
    }

    await db
        .update(subscribers)
        .set({
            unsubscribedAt: new Date(),
            isVerified: false,
            verificationToken: null,
        })
        .where(eq(subscribers.email, email));

    return c.json({ success: true }, 200);
});

app.use("/admin/*", requireAuth, requireAdmin);

const subscriberRowSchema = z.object({
    id: z.string(),
    email: z.string(),
    source: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    isVerified: z.boolean().nullable().optional(),
    subscribedAt: z.any().optional(),
    verifiedAt: z.any().optional(),
    unsubscribedAt: z.any().optional(),
});

const listSubscribersRoute = createRoute({
    method: "get",
    path: "/admin/newsletter/subscribers",
    tags: ["Admin", "Newsletter"],
    summary: "List newsletter subscribers and stats",
    description: "Returns newsletter stats, subscribers, active deals for compose, and saved draft.",
    responses: {
        200: {
            description: "Newsletter subscribers and stats",
            content: {
                "application/json": {
                    schema: z.object({
                        totals: z.object({
                            total: z.number(),
                            verified: z.number(),
                            unsubscribed: z.number(),
                        }),
                        byCountry: z.array(z.object({
                            country: z.string(),
                            count: z.number(),
                        })),
                        subscribers: z.array(subscriberRowSchema),
                        activeDeals: z.array(NewsletterDealSchema),
                        draft: NewsletterDraftResponseSchema.nullable(),
                    }),
                },
            },
        },
    },
});

app.openapi(listSubscribersRoute, async (c) => {
    const subscriberRows = await db.select().from(subscribers).orderBy(desc(subscribers.subscribedAt));
    const activeDealRows = await db
        .select({
            id: deals.id,
            slug: deals.slug,
            title: deals.title,
            discountLabel: deals.discountLabel,
            shortDescription: deals.shortDescription,
            brandName: brands.name,
        })
        .from(deals)
        .innerJoin(brands, eq(deals.brandId, brands.id))
        .where(eq(deals.isActive, true))
        .orderBy(desc(deals.createdAt));

    const total = subscriberRows.length;
    const verified = subscriberRows.filter((subscriber) => subscriber.isVerified && !subscriber.unsubscribedAt).length;
    const unsubscribed = subscriberRows.filter((subscriber) => Boolean(subscriber.unsubscribedAt)).length;

    const countryCounts = new Map<string, number>();
    for (const subscriber of subscriberRows) {
        const country = subscriber.country ?? "Unknown";
        countryCounts.set(country, (countryCounts.get(country) ?? 0) + 1);
    }

    const byCountry = Array.from(countryCounts.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);

    const draft = await readNewsletterDraft();
    const activeDeals = activeDealRows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        discountLabel: row.discountLabel,
        shortDescription: row.shortDescription ?? "",
        brandName: row.brandName,
    }));

    return c.json({
        totals: {
            total,
            verified,
            unsubscribed,
        },
        byCountry,
        subscribers: subscriberRows,
        activeDeals,
        draft,
    }, 200);
});

const previewNewsletterRoute = createRoute({
    method: "post",
    path: "/admin/newsletter/preview",
    tags: ["Admin", "Newsletter"],
    summary: "Send newsletter preview",
    description: "Sends newsletter preview to a single email address.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: NewsletterPreviewRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Preview sent",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                        previewRecipient: z.string().email(),
                        dealCount: z.number(),
                    }),
                },
            },
        },
        400: {
            description: "Invalid request",
            content: {
                "application/json": {
                    schema: z.object({ error: z.string() }),
                },
            },
        },
    },
});

app.openapi(previewNewsletterRoute, async (c) => {
    const body = c.req.valid("json");
    await saveNewsletterDraft(body);

    const selectedDeals = await resolveNewsletterDeals(body.dealIds);
    if (selectedDeals.length === 0) {
        throw new BadRequestError("At least one active deal is required to send a preview.");
    }

    const appOrigin = getAppOrigin(c);
    const signingSecret = getSigningSecret(c);
    const previewRecipient = normalizeEmail(body.previewEmail);
    const unsubscribeToken = await createSignedEmailToken(signingSecret, previewRecipient);
    const unsubscribeUrl = new URL(`/api/subscribe/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`, appOrigin).toString();
    const emailConfig = getEmailConfig(c);

    await sendEmail({
        apiKey: emailConfig.apiKey,
        fromEmail: emailConfig.fromEmail,
        to: previewRecipient,
        subject: body.subject,
        react: createElement(WeeklyDigestEmail, {
            deals: selectedDeals,
            introText: body.introText ?? undefined,
            unsubscribeUrl,
        }),
    });

    return c.json({
        success: true,
        previewRecipient,
        dealCount: selectedDeals.length,
    }, 200);
});

const sendNewsletterRoute = createRoute({
    method: "post",
    path: "/admin/newsletter/send",
    tags: ["Admin", "Newsletter"],
    summary: "Send newsletter campaign",
    description: "Sends newsletter campaign to all verified, non-unsubscribed subscribers.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: NewsletterDraftSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Campaign sent",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                        recipients: z.number(),
                        dealCount: z.number(),
                    }),
                },
            },
        },
        400: {
            description: "Invalid request",
            content: {
                "application/json": {
                    schema: z.object({ error: z.string() }),
                },
            },
        },
    },
});

app.openapi(sendNewsletterRoute, async (c) => {
    const body = c.req.valid("json");
    await saveNewsletterDraft(body);

    const selectedDeals = await resolveNewsletterDeals(body.dealIds);
    if (selectedDeals.length === 0) {
        throw new BadRequestError("At least one active deal is required to send a campaign.");
    }

    const recipients = await db
        .select({ email: subscribers.email })
        .from(subscribers)
        .where(and(eq(subscribers.isVerified, true), isNull(subscribers.unsubscribedAt)));

    if (recipients.length === 0) {
        throw new BadRequestError("No verified subscribers available to receive this campaign.");
    }

    const appOrigin = getAppOrigin(c);
    const signingSecret = getSigningSecret(c);
    const emailConfig = getEmailConfig(c);

    await Promise.all(recipients.map(async ({ email }) => {
        const unsubscribeToken = await createSignedEmailToken(signingSecret, email);
        const unsubscribeUrl = new URL(`/api/subscribe/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`, appOrigin).toString();

        await sendEmail({
            apiKey: emailConfig.apiKey,
            fromEmail: emailConfig.fromEmail,
            to: email,
            subject: body.subject,
            react: createElement(WeeklyDigestEmail, {
                deals: selectedDeals,
                introText: body.introText ?? undefined,
                unsubscribeUrl,
            }),
        });
    }));

    return c.json({
        success: true,
        recipients: recipients.length,
        dealCount: selectedDeals.length,
    }, 200);
});

export default app;
