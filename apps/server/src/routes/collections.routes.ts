import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getCollections, getCollectionBySlug } from "../services/collection.service";
import { BadRequestError } from "../lib/errors";

const app = new OpenAPIHono();

const CollectionSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    coverImageUrl: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    isFeatured: z.boolean().nullable().optional(),
    displayOrder: z.number().nullable().optional(),
    // Add other fields as needed
});

const CollectionsListResponseSchema = z.object({
    collections: z.array(CollectionSchema),
});

const listCollectionsRoute = createRoute({
    method: "get",
    path: "/",
    tags: ["Collections"],
    summary: "List Collections",
    description: "Get all collections, optionally filtered by featured status.",
    request: {
        query: z.object({
            featured: z.string().optional().openapi({ example: "true" }),
        }),
    },
    responses: {
        200: {
            description: "List of collections",
            content: {
                "application/json": {
                    schema: CollectionsListResponseSchema,
                },
            },
        },
    },
});

app.openapi(listCollectionsRoute, async (c) => {
    const featured = c.req.valid("query").featured === "true";
    const collections = await getCollections({ featured });
    return c.json({ collections }, 200);
});

const getCollectionRoute = createRoute({
    method: "get",
    path: "/{slug}",
    tags: ["Collections"],
    summary: "Get Collection",
    description: "Get collection detail with all deals.",
    request: {
        params: z.object({
            slug: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Collection details",
            content: {
                "application/json": {
                    schema: z.any(), // Flexible schema for collection + deals
                },
            },
        },
        400: {
            description: "Bad Request",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(getCollectionRoute, async (c) => {
    const { slug } = c.req.valid("param");

    if (!slug) {
        throw new BadRequestError("Collection slug is required");
    }

    const result = await getCollectionBySlug(slug);
    return c.json(result, 200);
});

export default app;
