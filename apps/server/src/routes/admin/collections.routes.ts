import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db, collections, collectionDeals, deals, brands, categories, eq, sql } from "@uni-perks/db";
import { BadRequestError } from "../../lib/errors";
import { CreateCollectionSchema, UpdateCollectionSchema } from "../../schemas/admin.schemas";

const app = new OpenAPIHono();

const CollectionSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    audience: z.string().nullable().optional(),
    isFeatured: z.boolean().nullable().optional(),
    displayOrder: z.number().nullable().optional(),
    coverImageUrl: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
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
                    schema: CreateCollectionSchema,
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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(createCollectionRoute, async (c) => {
    const body = c.req.valid("json");

    const payload = {
        name: body.name,
        slug: body.slug,
        description: body.description ?? null,
        audience: body.audience ?? null,
        isFeatured: body.isFeatured ?? false,
        displayOrder: body.displayOrder ?? 0,
        coverImageUrl: body.coverImageUrl ?? null,
        icon: body.icon ?? null,
        metaTitle: body.metaTitle ?? null,
        metaDescription: body.metaDescription ?? null,
    };

    const [created] = await db.insert(collections).values(payload).returning();
    if (!created) throw new BadRequestError("Failed to create collection");
    return c.json(created, 201);
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
                    schema: UpdateCollectionSchema,
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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(updateCollectionRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const payload = {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.description !== undefined ? { description: body.description ?? null } : {}),
        ...(body.audience !== undefined ? { audience: body.audience ?? null } : {}),
        ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
        ...(body.displayOrder !== undefined ? { displayOrder: body.displayOrder } : {}),
        ...(body.coverImageUrl !== undefined ? { coverImageUrl: body.coverImageUrl ?? null } : {}),
        ...(body.icon !== undefined ? { icon: body.icon ?? null } : {}),
        ...(body.metaTitle !== undefined ? { metaTitle: body.metaTitle ?? null } : {}),
        ...(body.metaDescription !== undefined ? { metaDescription: body.metaDescription ?? null } : {}),
    };

    const [updated] = await db
        .update(collections)
        .set(payload)
        .where(eq(collections.id, id))
        .returning();

    if (!updated) {
        throw new BadRequestError("Collection not found");
    }

    return c.json(updated, 200);
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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(deleteCollectionRoute, async (c) => {
    const { id } = c.req.valid("param");

    await db.delete(collectionDeals).where(eq(collectionDeals.collectionId, id));
    const [deleted] = await db.delete(collections).where(eq(collections.id, id)).returning();

    if (!deleted) {
        throw new BadRequestError("Collection not found");
    }

    return c.json({ success: true }, 200);
});

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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(addDealToCollectionRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
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
    const { orders } = c.req.valid("json");

    for (const order of orders) {
        await db
            .update(collectionDeals)
            .set({ displayOrder: order.displayOrder })
            .where(sql`${collectionDeals.collectionId} = ${id} AND ${collectionDeals.dealId} = ${order.dealId}`);
    }

    return c.json({ success: true }, 200);
});

export default app;
