import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { env } from "cloudflare:workers";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";
import { BadRequestError } from "../lib/errors";

const app = new OpenAPIHono();

// Apply auth middleware - only admins can upload
app.use("*", requireAuth, requireAdmin);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const ALLOWED_FOLDERS = ["brands", "deals", "categories", "collections"] as const;

const uploadRoute = createRoute({
    method: "post",
    path: "/",
    tags: ["Upload"],
    summary: "Upload Image",
    description: "Upload an image to R2 storage. Admin only.",
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: z.object({
                        file: z.any().describe("Image file (jpeg, png, webp, svg)"),
                        folder: z.string().optional().describe("Optional folder path (e.g., 'brands', 'deals')"),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: "Upload successful",
            content: {
                "application/json": {
                    schema: z.object({
                        url: z.string(),
                        key: z.string(),
                    }),
                },
            },
        },
        400: {
            description: "Invalid request",
            content: { "application/json": { schema: z.object({ error: z.string() }) } },
        },
    },
});

app.openapi(uploadRoute, async (c) => {
    const body = await c.req.parseBody();

    const file = body.file as File;
    const folder = body.folder as string | undefined;

    if (!file) {
        throw new BadRequestError("No file provided");
    }
    if (folder && !ALLOWED_FOLDERS.includes(folder as (typeof ALLOWED_FOLDERS)[number])) {
        throw new BadRequestError(`Folder must be one of: ${ALLOWED_FOLDERS.join(", ")}`);
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new BadRequestError(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestError(`File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Generate unique key
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().slice(0, 8);
    const extension = file.name.split(".").pop() || "jpg";
    const key = folder
        ? `${folder}/${timestamp}-${randomId}.${extension}`
        : `${timestamp}-${randomId}.${extension}`;

    // Upload to R2
    const bucket = env.BUCKET;
    if (!bucket) {
        throw new BadRequestError("R2 bucket not configured");
    }

    await bucket.put(key, file.stream(), {
        httpMetadata: {
            contentType: file.type,
        },
    });

    // Return the key - the frontend can construct the URL based on environment
    return c.json({
        url: key, // The key can be used to construct the public URL
        key,
    }, 200);
});

const deleteRoute = createRoute({
    method: "delete",
    path: "/{key}",
    tags: ["Upload"],
    summary: "Delete Image",
    description: "Delete an image from R2 storage. Admin only.",
    request: {
        params: z.object({
            key: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Delete successful",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                    }),
                },
            },
        },
        400: {
            description: "Invalid request",
            content: { "application/json": { schema: z.object({ error: z.string() }) } },
        },
    },
});

app.openapi(deleteRoute, async (c) => {
    const { key } = c.req.valid("param");

    const bucket = env.BUCKET;
    if (!bucket) {
        throw new BadRequestError("R2 bucket not configured");
    }

    await bucket.delete(key);

    return c.json({ success: true }, 200);
});

export default app;
