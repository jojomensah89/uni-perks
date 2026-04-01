import { createElement } from "react";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { db, deals, brands, subscribers, eq, and, isNull, desc, sql } from "@uni-perks/db";
import { WeeklyDigestEmail } from "../emails/weekly-digest";
import { logInfo, logError } from "./logger";

export interface NewsletterDeal {
    id: string;
    slug: string;
    title: string;
    discountLabel: string;
    shortDescription: string;
    brandName: string;
    brandLogoUrl?: string | null;
    claimUrl: string;
    expiresAt?: Date | null;
    hotnessScore: number;
}

export interface SubscriberEmail {
    email: string;
}

export interface NewsletterConfig {
    apiKey: string;
    fromEmail: string;
    appOrigin: string;
    signingSecret: string;
    dealCount: number;
    hotnessThreshold: number;
}

function toBase64Url(bytes: Uint8Array): string {
    const binary = Array.from(bytes).map((byte) => String.fromCharCode(byte)).join("");
    return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function signValue(secret: string, value: string): Promise<string> {
    const encoder = new TextEncoder();
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

export async function createSignedEmailToken(secret: string, email: string): Promise<string> {
    const encoder = new TextEncoder();
    const normalizedEmail = email.trim().toLowerCase();
    const payload = toBase64Url(encoder.encode(normalizedEmail));
    const signature = await signValue(secret, payload);
    return `${payload}.${signature}`;
}

export async function fetchTopDeals(config: { dealCount: number; hotnessThreshold: number }): Promise<NewsletterDeal[]> {
    const { dealCount, hotnessThreshold } = config;

    const rows = await db
        .select({
            id: deals.id,
            slug: deals.slug,
            title: deals.title,
            discountLabel: deals.discountLabel,
            shortDescription: deals.shortDescription,
            brandName: brands.name,
            brandLogoUrl: brands.logoUrl,
            claimUrl: deals.claimUrl,
            expiresAt: deals.expiresAt,
            hotnessScore: deals.hotnessScore,
        })
        .from(deals)
        .innerJoin(brands, eq(deals.brandId, brands.id))
        .where(and(
            eq(deals.status, "published"),
            sql`${deals.hotnessScore} >= ${hotnessThreshold}`,
        ))
        .orderBy(desc(deals.hotnessScore), desc(deals.createdAt))
        .limit(dealCount);

    logInfo("newsletter-agent", `Fetched ${rows.length} top deals`, {
        dealCount: rows.length,
        hotnessThreshold,
    });

    return rows.map(row => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        discountLabel: row.discountLabel,
        shortDescription: row.shortDescription ?? "",
        brandName: row.brandName,
        brandLogoUrl: row.brandLogoUrl,
        claimUrl: row.claimUrl,
        expiresAt: row.expiresAt,
        hotnessScore: row.hotnessScore ?? 50,
    }));
}

export async function getVerifiedSubscribers(): Promise<SubscriberEmail[]> {
    const rows = await db
        .select({ email: subscribers.email })
        .from(subscribers)
        .where(and(
            eq(subscribers.isVerified, true),
            isNull(subscribers.unsubscribedAt),
            eq(subscribers.notifyGlobalDeals, true),
        ));

    logInfo("newsletter-agent", `Found ${rows.length} verified subscribers`, {
        subscriberCount: rows.length,
    });

    return rows.map(row => ({
        email: row.email,
    }));
}

export interface SendResult {
    success: boolean;
    sent: number;
    failed: number;
    errors: string[];
}

export async function sendBatchEmails(
    config: NewsletterConfig,
    deals: NewsletterDeal[],
    subscribers: SubscriberEmail[]
): Promise<SendResult> {
    const { apiKey, fromEmail, appOrigin, signingSecret } = config;

    if (!apiKey) {
        return {
            success: false,
            sent: 0,
            failed: 0,
            errors: ["RESEND_API_KEY not configured"],
        };
    }

    if (deals.length === 0) {
        return {
            success: false,
            sent: 0,
            failed: 0,
            errors: ["No deals to send"],
        };
    }

    if (subscribers.length === 0) {
        return {
            success: false,
            sent: 0,
            failed: 0,
            errors: ["No subscribers to send to"],
        };
    }

    const resend = new Resend(apiKey);
    const result: SendResult = {
        success: true,
        sent: 0,
        failed: 0,
        errors: [],
    };

    const BATCH_SIZE = 100;
    const unsubscribeBase = `${appOrigin}/api/newsletter/subscribe/unsubscribe`;

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
        const batch = subscribers.slice(i, i + BATCH_SIZE);

        const batchPromises = batch.map(async (subscriber) => {
            try {
                const unsubscribeToken = await createSignedEmailToken(signingSecret, subscriber.email);
                const unsubscribeUrl = `${unsubscribeBase}?token=${encodeURIComponent(unsubscribeToken)}`;

                const html = await render(
                    createElement(WeeklyDigestEmail, {
                        deals,
                        introText: `Here are the hottest student deals this week, curated just for you. Don't miss out!`,
                        unsubscribeUrl,
                    })
                );

                const text = await render(
                    createElement(WeeklyDigestEmail, {
                        deals,
                        introText: `Here are the hottest student deals this week, curated just for you. Don't miss out!`,
                        unsubscribeUrl,
                    }),
                    { plainText: true }
                );

                return {
                    email: subscriber.email,
                    unsubscribeUrl,
                    html,
                    text,
                };
            } catch (err) {
                const error = err instanceof Error ? err.message : "Unknown error";
                logError("newsletter-agent", "Failed to prepare email", {
                    email: subscriber.email,
                    error,
                });
                result.errors.push(`${subscriber.email}: ${error}`);
                result.failed++;
                return null;
            }
        });

        const preparedEmails = await Promise.all(batchPromises);
        const validEmails = preparedEmails.filter((e): e is NonNullable<typeof e> => e !== null);

        if (validEmails.length > 0) {
            try {
                const { data, error } = await resend.batch.send(
                    validEmails.map((emailData) => ({
                        from: fromEmail,
                        to: emailData.email,
                        subject: "Your Weekly Student Deals are Here 🔥",
                        html: emailData.html,
                        text: emailData.text,
                    }))
                );

                if (error) {
                    logError("newsletter-agent", "Batch send failed", { error });
                    result.errors.push(`Batch error: ${error.message}`);
                    result.failed += validEmails.length;
                } else {
                    result.sent += validEmails.length;
                    logInfo("newsletter-agent", `Sent batch of ${validEmails.length} emails`, {
                        batchId: data?.id,
                    });
                }
            } catch (err) {
                const error = err instanceof Error ? err.message : "Unknown error";
                logError("newsletter-agent", "Batch send exception", { error });
                result.errors.push(`Batch exception: ${error}`);
                result.failed += validEmails.length;
            }
        }

        if (i + BATCH_SIZE < subscribers.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    result.success = result.failed === 0;
    return result;
}

export interface SendNewsletterResult {
    success: boolean;
    dealCount: number;
    subscriberCount: number;
    sent: number;
    failed: number;
    errors: string[];
}

export async function sendWeeklyNewsletter(
    config: NewsletterConfig
): Promise<SendNewsletterResult> {
    logInfo("newsletter-agent", "Starting weekly newsletter send");

    const topDeals = await fetchTopDeals({
        dealCount: config.dealCount,
        hotnessThreshold: config.hotnessThreshold,
    });

    const subs = await getVerifiedSubscribers();

    const result = await sendBatchEmails(config, topDeals, subs);

    logInfo("newsletter-agent", "Newsletter send complete", {
        dealCount: topDeals.length,
        subscriberCount: subs.length,
        sent: result.sent,
        failed: result.failed,
    });

    return {
        success: result.success,
        dealCount: topDeals.length,
        subscriberCount: subs.length,
        sent: result.sent,
        failed: result.failed,
        errors: result.errors,
    };
}
