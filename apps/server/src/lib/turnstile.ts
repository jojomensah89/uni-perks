import type { Context } from "hono";

interface TurnstileVerificationResponse {
    success: boolean;
    "error-codes"?: string[];
}

export async function verifyTurnstile(c: Context, token: string | null | undefined): Promise<boolean> {
    const secret = (c.env as { TURNSTILE_SECRET?: string; TURNSTILE_SECRET_KEY?: string }).TURNSTILE_SECRET
        ?? (c.env as { TURNSTILE_SECRET?: string; TURNSTILE_SECRET_KEY?: string }).TURNSTILE_SECRET_KEY;

    // Allow local/dev environments to run without Turnstile configured.
    if (!secret) return true;
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

        if (!response.ok) {
            return false;
        }

        const payload = await response.json() as TurnstileVerificationResponse;
        return payload.success === true;
    } catch {
        return false;
    }
}
