import { PostHog } from "posthog-node";

const DEFAULT_HOST = "https://eu.posthog.com";

export async function captureEvent(
  event: string,
  properties: Record<string, unknown>,
  apiKey: string | undefined,
  distinctId?: string,
  host?: string,
) {
  if (!apiKey) return;
  const resolvedHost = host || DEFAULT_HOST;
  const client = new PostHog(apiKey, {
    host: resolvedHost,
    flushAt: 1,
    flushInterval: 1000,
  });
  try {
    client.capture({
      event,
      distinctId: distinctId || (properties.deal_id as string) || "anonymous",
      properties,
    });
    await client.flush();
  } catch (error) {
    console.error("PostHog capture failed", error);
  } finally {
    client.shutdown();
  }
}
