import type { Context } from "hono";

export async function withEdgeCache(
    c: Context,
    ttlSeconds: number,
    handler: () => Promise<Response>,
    cacheKey?: Request
): Promise<Response> {
    const cache = caches.default;
    const key = cacheKey ?? new Request(c.req.url);

    const cached = await cache.match(key);
    if (cached) {
        return cached;
    }

    const response = await handler();
    if (response.status === 200) {
        const clonedResponse = response.clone();
        const toCache = new Response(clonedResponse.body, response);
        toCache.headers.set("Cache-Control", `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}`);
        if (c.executionCtx) {
            c.executionCtx.waitUntil(cache.put(key, toCache));
        } else {
            await cache.put(key, toCache);
        }
    }

    return response;
}
