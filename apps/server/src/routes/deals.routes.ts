import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getDeals, getDealDetail, trackDealView } from "../services/deal.service";
import { getGeoData } from "../services/geo.service";
import { BadRequestError } from "../lib/errors";

const app = new OpenAPIHono();

// Reusable Schemas
const DealSchema = z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    shortDescription: z.string(),
    longDescription: z.string(),
    discountType: z.string(),
    discountValue: z.number().nullable().optional(),
    discountLabel: z.string(),
    originalPrice: z.number().nullable().optional(),
    studentPrice: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    verificationMethod: z.string(),
    claimUrl: z.string(),
    isFeatured: z.boolean().nullable().optional(),
    isActive: z.boolean().nullable().optional(),
    brandId: z.string(),
    categoryId: z.string(),
    // Add other fields as needed
});

const DealsListResponseSchema = z.object({
    deals: z.array(DealSchema),
    meta: z.object({
        total: z.number(),
        country: z.string(),
        limit: z.number(),
        offset: z.number(),
    }),
});

// Routes
const listDealsRoute = createRoute({
    method: "get",
    path: "/",
    tags: ["Deals"],
    summary: "List Deals",
    description: "Get a paginated list of deals, optionally filtered by category, featured status, collection, or search query.",
    request: {
        query: z.object({
            country: z.string().optional(),
            category: z.string().optional(),
            collectionId: z.string().optional(),
            featured: z.string().optional().openapi({ example: "true" }),
            region: z.string().optional(),
            q: z.string().optional(),
            limit: z.string().optional().default("50"),
            offset: z.string().optional().default("0"),
        }),
    },
    responses: {
        200: {
            description: "Successful response",
            content: {
                "application/json": {
                    schema: DealsListResponseSchema,
                },
            },
        },
    },
});

app.openapi(listDealsRoute, async (c) => {
    const geoData = getGeoData(c.req.raw);
    const query = c.req.valid("query");

    const requestedCountry = query.country || geoData.country;
    const categorySlug = query.category;
    const collectionId = query.collectionId;
    const featured = query.featured === "true";
    const regionCode = query.region;
    const searchQuery = query.q;
    const limit = parseInt(query.limit || "50");
    const offset = parseInt(query.offset || "0");

    const results = await getDeals({
        country: requestedCountry,
        categorySlug,
        collectionId,
        featured,
        regionCode,
        searchQuery,
        limit,
        offset,
    });

    return c.json({
        deals: results as any, // Cast to any to avoid strict schema mismatch with Join results for now
        meta: {
            total: results.length,
            country: requestedCountry,
            limit,
            offset,
        },
    }, 200);
});

const getDealRoute = createRoute({
    method: "get",
    path: "/{slug}",
    tags: ["Deals"],
    summary: "Get Deal Detail",
    description: "Get detailed information for a specific deal by its slug.",
    request: {
        params: z.object({
            slug: z.string(),
        }),
        query: z.object({
            country: z.string().optional(),
        }),
    },
    responses: {
        200: {
            description: "Deal details",
            content: {
                "application/json": {
                    schema: z.object({ deal: DealSchema, related: z.array(DealSchema).optional() }),
                }
            },
        },
        400: {
            description: "Bad Request",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(getDealRoute, async (c) => {
    const { slug } = c.req.valid("param");
    const query = c.req.valid("query");

    if (!slug) {
        throw new BadRequestError("Deal slug is required");
    }

    const geoData = getGeoData(c.req.raw);
    const country = query.country || geoData.country;

    const result = await getDealDetail({ slug, country });

    // Track view asynchronously (fire and forget)
    c.executionCtx.waitUntil(trackDealView(result.deal.id));

    return c.json(result, 200);
});

export default app;
