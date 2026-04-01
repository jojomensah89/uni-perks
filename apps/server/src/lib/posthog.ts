import { PostHog } from "posthog-node";

const host = "https://us.posthog.com";

export async function captureEvent(
  event: string,
  properties: Record<string, unknown>,
  apiKey: string | undefined,
  distinctId?: string
) {
  if (!apiKey) return;
  const client = new PostHog(apiKey, {
    host,
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
