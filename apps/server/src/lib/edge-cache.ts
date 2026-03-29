import type { Context } from "hono";
import { logInfo } from "./logger";

export async function withEdgeCache<T>(
    c: Context,
    ttlSeconds: number,
    handler: () => Promise<T>,
    cacheKey?: Request
): Promise<{ data: T }> {
    const cache = caches.default;
    const key = cacheKey ?? new Request(c.req.url);

    const cached = await cache.match(key);
    if (cached) {
        logInfo("edge-cache", "cache hit", { url: c.req.url });
        const response = new Response(cached.body, cached);
        response.headers.set("x-cache", "hit");
        return { data: await response.json() as T };
    }

    logInfo("edge-cache", "cache miss", { url: c.req.url });
    const data = await handler();
    const response = c.json(data);

    if (response.status === 200) {
        const clonedResponse = response.clone();
        const toCache = new Response(clonedResponse.body, clonedResponse);
        toCache.headers.set("Cache-Control", `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}`);
        if (c.executionCtx) {
            c.executionCtx.waitUntil(cache.put(key, toCache));
        } else {
            await cache.put(key, toCache);
        }
    }

    response.headers.set("x-cache", "miss");
    return { data };
}
