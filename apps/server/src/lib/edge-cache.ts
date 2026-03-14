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
        console.log(`[EDGE CACHE] HIT: ${c.req.url}`);
        const response = new Response(cached.body, cached);
        response.headers.set("x-cache", "hit");
        return response;
    }

    console.log(`[EDGE CACHE] MISS: ${c.req.url}`);
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

    const finalResponse = new Response(response.body, response);
    finalResponse.headers.set("x-cache", "miss");
    return finalResponse;
}
