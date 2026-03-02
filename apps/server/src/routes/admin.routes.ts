import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";
import { BadRequestError } from "../lib/errors";
import { db, deals, brands, categories, collections, collectionDeals, siteSettings, eq, desc, sql } from "@uni-perks/db";

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

// ===== COLLECTIONS CRUD =====

const CollectionSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    audience: z.string().nullable().optional(),
    isFeatured: z.boolean().nullable().optional(),
    displayOrder: z.number().nullable().optional(),
    coverImageUrl: z.string().nullable().optional(),
    createdAt: z.string().optional(),
});

const listCollectionsRoute = createRoute({
    method: "get",
    path: "/collections",
    tags: ["Admin"],
    summary: "List Collections (Admin)",
    description: "Get all collections (Admin only).",
    responses: {
        200: {
            description: "List of collections",
            content: {
                "application/json": {
                    schema: z.object({
                        collections: z.array(CollectionSchema),
                    }),
                },
            },
        },
    },
});

app.openapi(listCollectionsRoute, async (c) => {
    const results = await db.select().from(collections).orderBy(collections.displayOrder);
    return c.json({ collections: results }, 200);
});

const getCollectionRoute = createRoute({
    method: "get",
    path: "/collections/{id}",
    tags: ["Admin"],
    summary: "Get Collection (Admin)",
    description: "Get collection with all deals (Admin only).",
    request: {
        params: z.object({
            id: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Collection details",
            content: { "application/json": { schema: z.any() } }
        },
        400: {
            description: "Not found",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(getCollectionRoute, async (c) => {
    const { id } = c.req.valid("param");

    const collection = await db
        .select()
        .from(collections)
        .where(eq(collections.id, id))
        .limit(1);

    if (!collection[0]) {
        throw new BadRequestError("Collection not found");
    }

    // Get deals in this collection
    const collectionDealList = await db
        .select({
            deal: deals,
            brand: brands,
            category: categories,
            displayOrder: collectionDeals.displayOrder,
        })
        .from(collectionDeals)
        .innerJoin(deals, eq(collectionDeals.dealId, deals.id))
        .innerJoin(brands, eq(deals.brandId, brands.id))
        .innerJoin(categories, eq(deals.categoryId, categories.id))
        .where(eq(collectionDeals.collectionId, id))
        .orderBy(collectionDeals.displayOrder);

    return c.json({
        collection: collection[0],
        deals: collectionDealList,
    }, 200);
});

const createCollectionRoute = createRoute({
    method: "post",
    path: "/collections",
    tags: ["Admin"],
    summary: "Create Collection (Admin)",
    description: "Create a new collection (Admin only).",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        name: z.string(),
                        slug: z.string(),
                        description: z.string().optional(),
                        audience: z.string().optional(),
                        isFeatured: z.boolean().optional(),
                        displayOrder: z.number().optional(),
                        coverImageUrl: z.string().optional(),
                    }),
                },
            },
        },
    },
    responses: {
        201: {
            description: "Collection created",
            content: { "application/json": { schema: CollectionSchema } }
        },
        400: {
            description: "Invalid request",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(createCollectionRoute, async (c) => {
    const body = await c.req.json();

    if (!body.name || !body.slug) {
        throw new BadRequestError("Missing required fields: name, slug");
    }

    const result = await db.insert(collections).values(body).returning();
    return c.json(result[0], 201);
});

const updateCollectionRoute = createRoute({
    method: "patch",
    path: "/collections/{id}",
    tags: ["Admin"],
    summary: "Update Collection (Admin)",
    description: "Update a collection (Admin only).",
    request: {
        params: z.object({
            id: z.string(),
        }),
        body: {
            content: {
                "application/json": {
                    schema: z.any(),
                },
            },
        },
    },
    responses: {
        200: {
            description: "Collection updated",
            content: { "application/json": { schema: CollectionSchema } }
        },
        400: {
            description: "Not found",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(updateCollectionRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = await c.req.json();

    const result = await db
        .update(collections)
        .set(body)
        .where(eq(collections.id, id))
        .returning();

    if (!result[0]) {
        throw new BadRequestError("Collection not found");
    }

    return c.json(result[0], 200);
});

const deleteCollectionRoute = createRoute({
    method: "delete",
    path: "/collections/{id}",
    tags: ["Admin"],
    summary: "Delete Collection (Admin)",
    description: "Delete a collection and its deal associations (Admin only).",
    request: {
        params: z.object({
            id: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Collection deleted",
            content: { "application/json": { schema: z.object({ success: z.boolean() }) } }
        },
        400: {
            description: "Not found",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(deleteCollectionRoute, async (c) => {
    const { id } = c.req.valid("param");

    // Delete collection-deal associations first
    await db.delete(collectionDeals).where(eq(collectionDeals.collectionId, id));

    // Delete collection
    const result = await db.delete(collections).where(eq(collections.id, id)).returning();

    if (!result[0]) {
        throw new BadRequestError("Collection not found");
    }

    return c.json({ success: true }, 200);
});

// ===== COLLECTION DEALS MANAGEMENT =====

const addDealToCollectionRoute = createRoute({
    method: "post",
    path: "/collections/{id}/deals",
    tags: ["Admin"],
    summary: "Add Deal to Collection (Admin)",
    description: "Add a deal to a collection (Admin only).",
    request: {
        params: z.object({
            id: z.string(),
        }),
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        dealId: z.string(),
                        displayOrder: z.number().optional(),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: "Deal added to collection",
            content: { "application/json": { schema: z.object({ success: z.boolean() }) } }
        },
        400: {
            description: "Invalid request",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(addDealToCollectionRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = await c.req.json();

    // Check if already exists
    const existing = await db
        .select()
        .from(collectionDeals)
        .where(sql`${collectionDeals.collectionId} = ${id} AND ${collectionDeals.dealId} = ${body.dealId}`)
        .limit(1);

    if (existing[0]) {
        throw new BadRequestError("Deal already in collection");
    }

    await db.insert(collectionDeals).values({
        collectionId: id,
        dealId: body.dealId,
        displayOrder: body.displayOrder || 0,
    });

    return c.json({ success: true }, 200);
});

const removeDealFromCollectionRoute = createRoute({
    method: "delete",
    path: "/collections/{collectionId}/deals/{dealId}",
    tags: ["Admin"],
    summary: "Remove Deal from Collection (Admin)",
    description: "Remove a deal from a collection (Admin only).",
    request: {
        params: z.object({
            collectionId: z.string(),
            dealId: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Deal removed from collection",
            content: { "application/json": { schema: z.object({ success: z.boolean() }) } }
        },
        400: {
            description: "Not found",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(removeDealFromCollectionRoute, async (c) => {
    const { collectionId, dealId } = c.req.valid("param");

    await db
        .delete(collectionDeals)
        .where(sql`${collectionDeals.collectionId} = ${collectionId} AND ${collectionDeals.dealId} = ${dealId}`);

    return c.json({ success: true }, 200);
});

const reorderCollectionDealsRoute = createRoute({
    method: "patch",
    path: "/collections/{id}/deals/reorder",
    tags: ["Admin"],
    summary: "Reorder Collection Deals (Admin)",
    description: "Update display order of deals in a collection (Admin only).",
    request: {
        params: z.object({
            id: z.string(),
        }),
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        orders: z.array(z.object({
                            dealId: z.string(),
                            displayOrder: z.number(),
                        })),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: "Order updated",
            content: { "application/json": { schema: z.object({ success: z.boolean() }) } }
        },
    },
});

app.openapi(reorderCollectionDealsRoute, async (c) => {
    const { id } = c.req.valid("param");
    const { orders } = await c.req.json();

    // Update each deal's display order
    for (const order of orders) {
        await db
            .update(collectionDeals)
            .set({ displayOrder: order.displayOrder })
            .where(sql`${collectionDeals.collectionId} = ${id} AND ${collectionDeals.dealId} = ${order.dealId}`);
    }

    return c.json({ success: true }, 200);
});

// ===== STATS =====

const getStatsRoute = createRoute({
    method: "get",
    path: "/stats",
    tags: ["Admin"],
    summary: "Get Admin Stats",
    description: "Get dashboard statistics (Admin only).",
    responses: {
        200: {
            description: "Stats",
            content: {
                "application/json": {
                    schema: z.object({
                        totalDeals: z.number(),
                        activeDeals: z.number(),
                        totalBrands: z.number(),
                        totalCategories: z.number(),
                        totalCollections: z.number(),
                        totalViews: z.number(),
                        totalClicks: z.number(),
                    }),
                },
            },
        },
    },
});

app.openapi(getStatsRoute, async (c) => {
    // Get counts
    const [dealStats] = await db
        .select({
            total: sql<number>`count(*)`,
            active: sql<number>`sum(case when ${deals.isActive} = 1 then 1 else 0 end)`,
            totalViews: sql<number>`sum(${deals.viewCount})`,
            totalClicks: sql<number>`sum(${deals.clickCount})`,
        })
        .from(deals);

    const [brandCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(brands);

    const [categoryCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(categories);

    const [collectionCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(collections);

    return c.json({
        totalDeals: dealStats?.total || 0,
        activeDeals: dealStats?.active || 0,
        totalBrands: brandCount?.count || 0,
        totalCategories: categoryCount?.count || 0,
        totalCollections: collectionCount?.count || 0,
        totalViews: dealStats?.totalViews || 0,
        totalClicks: dealStats?.totalClicks || 0,
    }, 200);
});

// ===== SETTINGS =====

const updateTickerRoute = createRoute({
    method: "put",
    path: "/settings/ticker",
    tags: ["Admin"],
    summary: "Update Ticker Messages",
    description: "Update the site ticker messages (Admin only).",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        messages: z.array(z.string()),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: "Ticker updated",
            content: { "application/json": { schema: z.object({ success: z.boolean() }) } }
        },
    },
});

app.openapi(updateTickerRoute, async (c) => {
    const { messages } = await c.req.json();

    const value = JSON.stringify(messages);

    // Upsert the setting
    const existing = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, "ticker_messages"))
        .limit(1);

    if (existing[0]) {
        await db
            .update(siteSettings)
            .set({ value, updatedAt: new Date() })
            .where(eq(siteSettings.id, existing[0].id));
    } else {
        await db.insert(siteSettings).values({
            key: "ticker_messages",
            value,
            description: "Messages displayed in the scrolling ticker banner",
        });
    }

    return c.json({ success: true }, 200);
});

// ===== CATEGORIES CRUD =====

const createCategoryRoute = createRoute({
    method: "post",
    path: "/categories",
    tags: ["Admin"],
    summary: "Create Category (Admin)",
    description: "Create a new category (Admin only).",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        name: z.string(),
                        slug: z.string(),
                        icon: z.string().optional(),
                        color: z.string().optional(),
                        coverImageUrl: z.string().optional(),
                        displayOrder: z.number().optional(),
                        metaTitle: z.string().optional(),
                        metaDescription: z.string().optional(),
                    }),
                },
            },
        },
    },
    responses: {
        201: {
            description: "Category created",
            content: { "application/json": { schema: z.any() } }
        },
        400: {
            description: "Invalid request",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(createCategoryRoute, async (c) => {
    const body = await c.req.json();

    if (!body.name || !body.slug) {
        throw new BadRequestError("Missing required fields: name, slug");
    }

    const result = await db.insert(categories).values(body).returning();
    return c.json(result[0], 201);
});

const updateCategoryRoute = createRoute({
    method: "patch",
    path: "/categories/{id}",
    tags: ["Admin"],
    summary: "Update Category (Admin)",
    description: "Update a category (Admin only).",
    request: {
        params: z.object({
            id: z.string(),
        }),
        body: {
            content: {
                "application/json": {
                    schema: z.any(),
                },
            },
        },
    },
    responses: {
        200: {
            description: "Category updated",
            content: { "application/json": { schema: z.any() } }
        },
        400: {
            description: "Not found",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(updateCategoryRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = await c.req.json();

    const result = await db
        .update(categories)
        .set(body)
        .where(eq(categories.id, id))
        .returning();

    if (!result[0]) {
        throw new BadRequestError("Category not found");
    }

    return c.json(result[0], 200);
});

const deleteCategoryRoute = createRoute({
    method: "delete",
    path: "/categories/{id}",
    tags: ["Admin"],
    summary: "Delete Category (Admin)",
    description: "Delete a category (Admin only).",
    request: {
        params: z.object({
            id: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Category deleted",
            content: { "application/json": { schema: z.object({ success: z.boolean() }) } }
        },
        400: {
            description: "Not found",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(deleteCategoryRoute, async (c) => {
    const { id } = c.req.valid("param");

    const result = await db.delete(categories).where(eq(categories.id, id)).returning();

    if (!result[0]) {
        throw new BadRequestError("Category not found");
    }

    return c.json({ success: true }, 200);
});

export default app;
