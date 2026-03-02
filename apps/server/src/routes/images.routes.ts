import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { env } from "cloudflare:workers";
import { NotFoundError } from "../lib/errors";

const app = new OpenAPIHono();

// Image serving route - serves images from R2 bucket
// This allows public access to uploaded images via /api/images/:key
const getImageRoute = createRoute({
    method: "get",
    path: "/{key}",
    tags: ["Images"],
    summary: "Get Image",
    description: "Serve an image from R2 storage.",
    request: {
        params: z.object({
            key: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Image file",
            content: {
                "image/*": {
                    schema: z.any(),
                },
            },
        },
        404: {
            description: "Image not found",
            content: { "application/json": { schema: z.object({ message: z.string() }) } },
        },
    },
});

app.openapi(getImageRoute, async (c) => {
    const { key } = c.req.valid("param");

    const bucket = env.BUCKET;
    if (!bucket) {
        throw new NotFoundError("R2 bucket not configured");
    }

    // Decode the key in case it was URL-encoded
    const decodedKey = decodeURIComponent(key);

    // Get the object from R2
    const object = await bucket.get(decodedKey);

    if (!object) {
        throw new NotFoundError("Image not found");
    }

    // Get the content type from the object's HTTP metadata or default to binary
    const contentType = object.httpMetadata?.contentType || "application/octet-stream";

    // Return the image with caching headers
    return new Response(object.body, {
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable", // 1 year cache
            "ETag": object.etag,
        },
    });
});

export default app;
