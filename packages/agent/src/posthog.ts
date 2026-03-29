import { PostHog } from 'posthog-node';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.POSTHOG_API_KEY;
const host = process.env.POSTHOG_HOST || 'https://us.posthog.com';

let client: PostHog | null = null;

export function initPosthog(apiKey: string, host?: string) {
  if (client) return client;
  client = new PostHog(apiKey, {
    host: host || "https://us.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
  return client;
}

export function getPosthog() {
    if (client) return client;
    if (!apiKey) return null;
    client = new PostHog(apiKey, {
      host,
      flushAt: 1,
      flushInterval: 1000,
    });
    return client;
}

/**
 * Capture an event with properties and a distinct ID.
 */
export async function captureAgentEvent(event: string, properties: Record<string, unknown>, distinctId?: string) {
    if (!client) return;
    try {
        client.capture({
            event,
            distinctId: distinctId || "uni-perks-agent",
            properties: {
                ...properties,
                agent_version: "1.0.0",
                env: process.env.NODE_ENV || 'development'
            },
        });
        await client.flush();
    } catch (error) {
        console.error("Agent PostHog capture failed", error);
    }
}

export async function shutdownPosthog() {
    await client?.shutdown();
}
