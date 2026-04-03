import type { Context } from "hono";

interface TurnstileVerificationResponse {
    success: boolean;
    "error-codes"?: string[];
}

export async function verifyTurnstile(c: Context, token: string | null | undefined): Promise<boolean> {
    const env = c.env as { TURNSTILE_SECRET?: string; TURNSTILE_SECRET_KEY?: string; TURNSTILE_ENABLED?: string };
    const secret = env.TURNSTILE_SECRET ?? env.TURNSTILE_SECRET_KEY;
    const enabled = (env.TURNSTILE_ENABLED ?? "true").toLowerCase() !== "false";

    // Safe rollback switch: disable verification immediately by setting TURNSTILE_ENABLED=false.
    // If no secret is configured, verification is skipped.
    if (!enabled || !secret) return true;
    if (!token) return false;

    const ip = c.req.header("cf-connecting-ip") ?? "";
    const body = new URLSearchParams({
        secret,
        response: token,
        remoteip: ip,
    });

    try {
        const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
        });

        if (!response.ok) return false;

        const payload = await response.json() as TurnstileVerificationResponse;
        return payload.success === true;
    } catch {
        // Fail closed: if verification service errors, auth should be rejected.
        return false;
    }
}
