import { PostHog } from "posthog-node";

const apiKey = process.env.POSTHOG_API_KEY;
const host = process.env.POSTHOG_HOST || "https://us.posthog.com";

let client: PostHog | null = null;

if (apiKey) {
    client = new PostHog(apiKey, {
        host,
        flushAt: 1,
        flushInterval: 1000,
    });
}

export async function captureEvent(event: string, properties: Record<string, unknown>, distinctId?: string) {
    if (!client) return;
    try {
        client.capture({
            event,
            distinctId: distinctId || (properties.deal_id as string) || "anonymous",
            properties,
        });
        await client.flushAsync();
    } catch (error) {
        // Swallow errors to avoid impacting request flow
        console.error("PostHog capture failed", error);
    }
}

export function shutdownPosthog() {
    client?.shutdown();
}
