import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";
import { BadRequestError } from "../lib/errors";
import { db, deals, brands, categories, eq, desc } from "@uni-perks/db";

const app = new OpenAPIHono();

// Apply auth middleware to all admin routes
app.use("*", requireAuth, requireAdmin);

const listDealsRoute = createRoute({
    method: "get",
    path: "/deals",
    tags: ["Admin"],
    summary: "List Deals (Admin)",
    description: "Get all deals with pagination (Admin only).",
    request: {
        query: z.object({
            page: z.string().optional().default("1"),
            limit: z.string().optional().default("50"),
        }),
    },
    responses: {
        200: {
            description: "List of deals",
            content: {
                "application/json": {
                    schema: z.object({
                        deals: z.array(z.any()), // Refine later
                        page: z.number(),
                        limit: z.number(),
                    }),
                },
            },
        },
    },
});

app.openapi(listDealsRoute, async (c) => {
    const query = c.req.valid("query");
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "50");
    const offset = (page - 1) * limit;

    const results = await db
        .select({
            deal: deals,
            brand: brands,
            category: categories,
        })
        .from(deals)
        .innerJoin(brands, eq(deals.brandId, brands.id))
        .innerJoin(categories, eq(deals.categoryId, categories.id))
        .orderBy(desc(deals.createdAt))
        .limit(limit)
        .offset(offset);

    return c.json({ deals: results, page, limit }, 200);
});

const getDealRoute = createRoute({
    method: "get",
    path: "/deals/{id}",
    tags: ["Admin"],
    summary: "Get Deal (Admin)",
    description: "Get single deal by ID (Admin only).",
    request: {
        params: z.object({
            id: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Deal details",
            content: { "application/json": { schema: z.any() } }
        },
        400: {
            description: "Not found",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(getDealRoute, async (c) => {
    const { id } = c.req.valid("param");

    const result = await db
        .select({
            deal: deals,
            brand: brands,
            category: categories,
        })
        .from(deals)
        .innerJoin(brands, eq(deals.brandId, brands.id))
        .innerJoin(categories, eq(deals.categoryId, categories.id))
        .where(eq(deals.id, id))
        .limit(1);

    if (!result[0]) {
        throw new BadRequestError("Deal not found");
    }

    return c.json(result[0], 200);
});

const createDealRoute = createRoute({
    method: "post",
    path: "/deals",
    tags: ["Admin"],
    summary: "Create Deal (Admin)",
    description: "Create a new deal (Admin only).",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.any(), // Refine later with CreateDealInputSchema
                },
            },
        },
    },
    responses: {
        201: {
            description: "Deal created",
            content: { "application/json": { schema: z.any() } }
        },
        400: {
            description: "Invalid request",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(createDealRoute, async (c) => {
    const body = await c.req.json();

    // Basic validation (zod should handle this if we define schema, but keeping legacy check for now)
    if (!body.title || !body.brandId || !body.categoryId || !body.claimUrl || !body.verificationMethod) {
        throw new BadRequestError("Missing required fields");
    }

    const result = await db.insert(deals).values(body).returning();
    return c.json(result[0], 201);
});

const updateDealRoute = createRoute({
    method: "patch",
    path: "/deals/{id}",
    tags: ["Admin"],
    summary: "Update Deal (Admin)",
    description: "Update a deal (Admin only).",
    request: {
        params: z.object({
            id: z.string(),
        }),
        body: {
            content: {
                "application/json": {
                    schema: z.any(), // Refine later
                },
            },
        },
    },
    responses: {
        200: {
            description: "Deal updated",
            content: { "application/json": { schema: z.any() } }
        },
        400: {
            description: "Not found",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(updateDealRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = await c.req.json();

    const result = await db
        .update(deals)
        .set(body)
        .where(eq(deals.id, id))
        .returning();

    if (!result[0]) {
        throw new BadRequestError("Deal not found");
    }

    return c.json(result[0], 200);
});

const deleteDealRoute = createRoute({
    method: "delete",
    path: "/deals/{id}",
    tags: ["Admin"],
    summary: "Delete Deal (Admin)",
    description: "Soft delete a deal (Admin only).",
    request: {
        params: z.object({
            id: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Deal deleted",
            content: { "application/json": { schema: z.any() } }
        },
        400: {
            description: "Not found",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(deleteDealRoute, async (c) => {
    const { id } = c.req.valid("param");

    const result = await db
        .update(deals)
        .set({ isActive: false })
        .where(eq(deals.id, id))
        .returning();

    if (!result[0]) {
        throw new BadRequestError("Deal not found");
    }

    return c.json(result[0], 200);
});

const BrandSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    isVerified: z.boolean().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
    coverImageUrl: z.string().nullable().optional(),
    createdAt: z.string().optional(), // Date often serialized
});

const listBrandsRoute = createRoute({
    method: "get",
    path: "/brands",
    tags: ["Admin"],
    summary: "List Brands (Admin)",
    description: "Get all brands (Admin only).",
    responses: {
        200: {
            description: "List of brands",
            content: {
                "application/json": {
                    schema: z.object({
                        brands: z.array(BrandSchema),
                    }),
                },
            },
        },
    },
});

app.openapi(listBrandsRoute, async (c) => {
    const results = await db.select().from(brands).orderBy(brands.name);
    return c.json({ brands: results }, 200);
});

const createBrandRoute = createRoute({
    method: "post",
    path: "/brands",
    tags: ["Admin"],
    summary: "Create Brand (Admin)",
    description: "Create a new brand (Admin only).",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.any(), // Refine later
                },
            },
        },
    },
    responses: {
        201: {
            description: "Brand created",
            content: { "application/json": { schema: z.any() } }
        },
        400: {
            description: "Invalid request",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(createBrandRoute, async (c) => {
    const body = await c.req.json();

    if (!body.name || !body.slug) {
        throw new BadRequestError("Missing required fields");
    }

    const result = await db.insert(brands).values(body).returning();
    return c.json(result[0], 201);
});

const updateBrandRoute = createRoute({
    method: "patch",
    path: "/brands/{id}",
    tags: ["Admin"],
    summary: "Update Brand (Admin)",
    description: "Update a brand (Admin only).",
    request: {
        params: z.object({
            id: z.string(),
        }),
        body: {
            content: {
                "application/json": {
                    schema: z.any(), // Refine later
                },
            },
        },
    },
    responses: {
        200: {
            description: "Brand updated",
            content: { "application/json": { schema: z.any() } }
        },
        400: {
            description: "Not found",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(updateBrandRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = await c.req.json();

    const result = await db
        .update(brands)
        .set(body)
        .where(eq(brands.id, id))
        .returning();

    if (!result[0]) {
        throw new BadRequestError("Brand not found");
    }

    return c.json(result[0], 200);
});

export default app;
