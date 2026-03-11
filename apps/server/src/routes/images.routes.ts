import { OpenAPIHono } from "@hono/zod-openapi";
import { env } from "cloudflare:workers";

const app = new OpenAPIHono();

// Image serving route - serves images from R2 bucket
// Uses app.get("/*") to handle nested keys like `deals/filename.jpg`,
// because OpenAPI param {key} only matches a single path segment.
app.get("/*", async (c) => {
    // Extract the full key from the request path (strip leading slash)
    // e.g. /api/images/deals/image.jpg -> deals/image.jpg
    const key = c.req.path.replace(/^\/api\/images\//, "");

    if (!key) {
        return c.json({ error: "Image key required" }, 404);
    }

    const bucket = (env as any).BUCKET;
    if (!bucket) {
        return c.json({ error: "R2 bucket not configured" }, 404);
    }

    // Decode the key in case it was URL-encoded
    const decodedKey = decodeURIComponent(key);

    // Get the object from R2
    const object = await bucket.get(decodedKey);

    if (!object) {
        return c.json({ error: "Image not found" }, 404);
    }

    // Get the content type from the object's HTTP metadata or default to binary
    const contentType = object.httpMetadata?.contentType || "application/octet-stream";

    // Return the image with caching headers
    return new Response(object.body, {
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable", // 1 year cache
            "ETag": object.etag,
            "Cross-Origin-Resource-Policy": "cross-origin",
            "Access-Control-Allow-Origin": (env as any).CORS_ORIGIN as string,
        },
    });
});

export default app;
