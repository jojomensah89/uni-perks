import type { Context } from "hono";

export interface RateLimitCheckResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    retryAfterSeconds: number;
}

export function getClientIp(c: Context): string {
    const cfIp = c.req.header("cf-connecting-ip");
    if (cfIp) return cfIp;

    const forwarded = c.req.header("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]!.trim();

    return "unknown";
}

export async function checkRateLimit(
    c: Context,
    keyPrefix: string,
    limit: number,
    windowSeconds: number
): Promise<RateLimitCheckResult> {
    const kv = (c.env as { KV?: KVNamespace }).KV;
    const now = Date.now();
    const bucket = Math.floor(now / (windowSeconds * 1000));
    const key = `rate-limit:${keyPrefix}:${bucket}`;

    if (!kv) {
        return {
            allowed: true,
            limit,
            remaining: limit - 1,
            retryAfterSeconds: 0,
        };
    }

    const current = Number.parseInt((await kv.get(key)) || "0", 10);
    const retryAfterSeconds = Math.max(1, windowSeconds - Math.floor((now / 1000) % windowSeconds));

    if (current >= limit) {
        return {
            allowed: false,
            limit,
            remaining: 0,
            retryAfterSeconds,
        };
    }

    await kv.put(key, String(current + 1), { expirationTtl: windowSeconds + 5 });

    return {
        allowed: true,
        limit,
        remaining: Math.max(0, limit - (current + 1)),
        retryAfterSeconds,
    };
}
