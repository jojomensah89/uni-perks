import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";
import { BadRequestError } from "../lib/errors";
import { db, deals, brands, categories, collections, collectionDeals, siteSettings, dealGeoConfig, user, eq, and, desc, sql } from "@uni-perks/db";
import {
    CreateBrandSchema,
    CreateCategorySchema,
    CreateCollectionSchema,
    CreateDealSchema,
    UpdateBrandSchema,
    UpdateCategorySchema,
    UpdateCollectionSchema,
    UpdateDealSchema,
} from "../schemas/admin.schemas";
import { invalidateKV } from "../lib/kv-cache";

const app = new OpenAPIHono();

// Apply auth middleware to all admin routes
app.use("*", requireAuth, requireAdmin);

function normalizeConditions(input?: string[] | string | null): string | null {
    if (!input) return null;
    if (Array.isArray(input)) return input.length > 0 ? JSON.stringify(input) : null;
    const lines = input
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    return lines.length > 0 ? JSON.stringify(lines) : null;
}

function normalizeExpirationDate(input?: string | number | null): Date | null {
    if (input === undefined || input === null) return null;
    if (typeof input === "number") return new Date(input);
    const parsed = Date.parse(input);
    return Number.isNaN(parsed) ? null : new Date(parsed);
}

const listDealsRoute = createRoute({
    method: "get",
    path: "/deals",
    tags: ["Admin"],
    summary: "List Deals (Admin)",
    description: "Get all deals with pagination (Admin only).",
    request: {
        query: z.object({
            page: z.string().regex(/^\d+$/).optional().default("1"),
            limit: z.string().regex(/^\d+$/).refine((val) => parseInt(val) <= 100, "Maximum limit is 100").optional().default("50"),
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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
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
                    schema: CreateDealSchema,
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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(createDealRoute, async (c) => {
    const body = c.req.valid("json");

    const payload = {
        slug: body.slug,
        title: body.title,
        shortDescription: body.shortDescription ?? "",
        longDescription: body.longDescription ?? "",
        brandId: body.brandId,
        categoryId: body.categoryId,
        discountType: body.discountType,
        discountLabel: body.discountLabel,
        discountValue: body.discountValue ?? null,
        originalPrice: body.originalPrice ?? null,
        studentPrice: body.studentPrice ?? null,
        currency: body.currency ?? "USD",
        verificationMethod: body.verificationMethod,
        claimUrl: body.claimUrl,
        affiliateUrl: body.affiliateUrl ?? null,
        coverImageUrl: body.coverImageUrl ?? null,
        howToRedeem: body.howToRedeem ?? null,
        eligibilityNote: body.eligibilityNote ?? null,
        termsUrl: body.termsUrl ?? null,
        minimumSpend: body.minimumSpend ?? null,
        isFeatured: body.isFeatured ?? false,
        isActive: body.isActive ?? true,
        isExclusive: body.isExclusive ?? false,
        isNewCustomerOnly: body.isNewCustomerOnly ?? false,
        conditions: normalizeConditions(body.conditions),
        expirationDate: normalizeExpirationDate(body.expirationDate),
        metaTitle: body.metaTitle ?? null,
        metaDescription: body.metaDescription ?? null,
    };

    const [created] = await db.insert(deals).values(payload).returning();
    if (!created) throw new BadRequestError("Failed to create deal");
    return c.json(created, 201);
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
                    schema: UpdateDealSchema,
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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(updateDealRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const payload = {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.shortDescription !== undefined ? { shortDescription: body.shortDescription ?? "" } : {}),
        ...(body.longDescription !== undefined ? { longDescription: body.longDescription ?? "" } : {}),
        ...(body.brandId !== undefined ? { brandId: body.brandId } : {}),
        ...(body.categoryId !== undefined ? { categoryId: body.categoryId } : {}),
        ...(body.discountType !== undefined ? { discountType: body.discountType } : {}),
        ...(body.discountLabel !== undefined ? { discountLabel: body.discountLabel } : {}),
        ...(body.discountValue !== undefined ? { discountValue: body.discountValue ?? null } : {}),
        ...(body.originalPrice !== undefined ? { originalPrice: body.originalPrice ?? null } : {}),
        ...(body.studentPrice !== undefined ? { studentPrice: body.studentPrice ?? null } : {}),
        ...(body.currency !== undefined ? { currency: body.currency } : {}),
        ...(body.verificationMethod !== undefined ? { verificationMethod: body.verificationMethod } : {}),
        ...(body.claimUrl !== undefined ? { claimUrl: body.claimUrl } : {}),
        ...(body.affiliateUrl !== undefined ? { affiliateUrl: body.affiliateUrl ?? null } : {}),
        ...(body.coverImageUrl !== undefined ? { coverImageUrl: body.coverImageUrl ?? null } : {}),
        ...(body.howToRedeem !== undefined ? { howToRedeem: body.howToRedeem ?? null } : {}),
        ...(body.eligibilityNote !== undefined ? { eligibilityNote: body.eligibilityNote ?? null } : {}),
        ...(body.termsUrl !== undefined ? { termsUrl: body.termsUrl ?? null } : {}),
        ...(body.minimumSpend !== undefined ? { minimumSpend: body.minimumSpend ?? null } : {}),
        ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
        ...(body.isExclusive !== undefined ? { isExclusive: body.isExclusive } : {}),
        ...(body.isNewCustomerOnly !== undefined ? { isNewCustomerOnly: body.isNewCustomerOnly } : {}),
        ...(body.conditions !== undefined ? { conditions: normalizeConditions(body.conditions ?? null) } : {}),
        ...(body.expirationDate !== undefined ? { expirationDate: normalizeExpirationDate(body.expirationDate) } : {}),
        ...(body.metaTitle !== undefined ? { metaTitle: body.metaTitle ?? null } : {}),
        ...(body.metaDescription !== undefined ? { metaDescription: body.metaDescription ?? null } : {}),
    };

    const [updated] = await db
        .update(deals)
        .set(payload)
        .where(eq(deals.id, id))
        .returning();

    if (!updated) {
        throw new BadRequestError("Deal not found");
    }

    return c.json(updated, 200);
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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(deleteDealRoute, async (c) => {
    const { id } = c.req.valid("param");

    const [deleted] = await db
        .update(deals)
        .set({ isActive: false })
        .where(eq(deals.id, id))
        .returning();

    if (!deleted) {
        throw new BadRequestError("Deal not found");
    }

    return c.json(deleted, 200);
});

const DealGeoConfigSchema = z.object({
    id: z.string(),
    dealId: z.string(),
    countryCode: z.string(),
    affiliateUrl: z.string().nullable().optional(),
    claimUrl: z.string().nullable().optional(),
    studentPrice: z.number().nullable().optional(),
    originalPrice: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    discountLabel: z.string().nullable().optional(),
    isAvailable: z.boolean().nullable().optional(),
    createdAt: z.string().optional(),
});

const UpsertDealGeoConfigSchema = z.object({
    affiliateUrl: z.string().url().max(2000).optional().nullable(),
    claimUrl: z.string().url().max(2000).optional().nullable(),
    studentPrice: z.number().min(0).optional().nullable(),
    originalPrice: z.number().min(0).optional().nullable(),
    currency: z.string().length(3).optional().nullable(),
    discountLabel: z.string().max(100).optional().nullable(),
    isAvailable: z.boolean().optional(),
});

const CountryCodeParamSchema = z
    .string()
    .toUpperCase()
    .regex(/^(GLOBAL|[A-Z]{2})$/);

const listDealGeoConfigRoute = createRoute({
    method: "get",
    path: "/deals/{id}/geo-config",
    tags: ["Admin"],
    summary: "List deal geo config (Admin)",
    description: "List all country-specific deal overrides for a deal.",
    request: {
        params: z.object({
            id: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Deal geo configuration rows",
            content: {
                "application/json": {
                    schema: z.object({
                        geoConfig: z.array(DealGeoConfigSchema),
                    }),
                },
            },
        },
    },
});

app.openapi(listDealGeoConfigRoute, async (c) => {
    const { id } = c.req.valid("param");
    const rows = await db
        .select()
        .from(dealGeoConfig)
        .where(eq(dealGeoConfig.dealId, id))
        .orderBy(dealGeoConfig.countryCode);

    return c.json({ geoConfig: rows }, 200);
});

const upsertDealGeoConfigRoute = createRoute({
    method: "put",
    path: "/deals/{id}/geo-config/{countryCode}",
    tags: ["Admin"],
    summary: "Upsert deal geo config (Admin)",
    description: "Create or update a country-specific deal override row.",
    request: {
        params: z.object({
            id: z.string(),
            countryCode: CountryCodeParamSchema,
        }),
        body: {
            content: {
                "application/json": {
                    schema: UpsertDealGeoConfigSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Geo configuration upserted",
            content: {
                "application/json": {
                    schema: DealGeoConfigSchema,
                },
            },
        },
        400: {
            description: "Invalid request",
            content: { "application/json": { schema: z.object({ error: z.string() }) } },
        },
    },
});

app.openapi(upsertDealGeoConfigRoute, async (c) => {
    const { id, countryCode } = c.req.valid("param");
    const body = c.req.valid("json");

    const dealExists = await db.select({ id: deals.id }).from(deals).where(eq(deals.id, id)).limit(1);
    if (!dealExists[0]) {
        throw new BadRequestError("Deal not found");
    }

    const existing = await db
        .select()
        .from(dealGeoConfig)
        .where(and(eq(dealGeoConfig.dealId, id), eq(dealGeoConfig.countryCode, countryCode)))
        .limit(1);

    const payload = {
        ...(body.affiliateUrl !== undefined ? { affiliateUrl: body.affiliateUrl ?? null } : {}),
        ...(body.claimUrl !== undefined ? { claimUrl: body.claimUrl ?? null } : {}),
        ...(body.studentPrice !== undefined ? { studentPrice: body.studentPrice ?? null } : {}),
        ...(body.originalPrice !== undefined ? { originalPrice: body.originalPrice ?? null } : {}),
        ...(body.currency !== undefined ? { currency: body.currency ?? null } : {}),
        ...(body.discountLabel !== undefined ? { discountLabel: body.discountLabel ?? null } : {}),
        ...(body.isAvailable !== undefined ? { isAvailable: body.isAvailable } : {}),
    };

    if (!existing[0]) {
        const [inserted] = await db
            .insert(dealGeoConfig)
            .values({
                dealId: id,
                countryCode,
                affiliateUrl: body.affiliateUrl ?? null,
                claimUrl: body.claimUrl ?? null,
                studentPrice: body.studentPrice ?? null,
                originalPrice: body.originalPrice ?? null,
                currency: body.currency ?? null,
                discountLabel: body.discountLabel ?? null,
                isAvailable: body.isAvailable ?? true,
            })
            .returning();
        if (!inserted) throw new BadRequestError("Failed to insert deal geo config");
        return c.json(inserted, 200);
    }

    if (Object.keys(payload).length === 0) {
        return c.json(existing[0], 200);
    }

    const [updated] = await db
        .update(dealGeoConfig)
        .set(payload)
        .where(eq(dealGeoConfig.id, existing[0].id))
        .returning();

    if (!updated) throw new BadRequestError("Failed to update deal geo config");

    return c.json(updated, 200);
});

const deleteDealGeoConfigRoute = createRoute({
    method: "delete",
    path: "/deals/{id}/geo-config/{countryCode}",
    tags: ["Admin"],
    summary: "Delete deal geo config (Admin)",
    description: "Delete a country-specific deal override row.",
    request: {
        params: z.object({
            id: z.string(),
            countryCode: CountryCodeParamSchema,
        }),
    },
    responses: {
        200: {
            description: "Geo configuration deleted",
            content: {
                "application/json": {
                    schema: z.object({ success: z.boolean() }),
                },
            },
        },
    },
});

app.openapi(deleteDealGeoConfigRoute, async (c) => {
    const { id, countryCode } = c.req.valid("param");

    await db
        .delete(dealGeoConfig)
        .where(and(eq(dealGeoConfig.dealId, id), eq(dealGeoConfig.countryCode, countryCode)));

    return c.json({ success: true }, 200);
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
                    schema: CreateBrandSchema,
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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(createBrandRoute, async (c) => {
    const body = c.req.valid("json");

    const payload = {
        name: body.name,
        slug: body.slug,
        tagline: body.tagline ?? null,
        description: body.description ?? null,
        website: body.website ?? null,
        logoUrl: body.logoUrl ?? null,
        coverImageUrl: body.coverImageUrl ?? null,
        whyWeLoveIt: body.whyWeLoveIt ?? null,
        isVerified: body.isVerified ?? false,
        metaTitle: body.metaTitle ?? null,
        metaDescription: body.metaDescription ?? null,
    };

    const [created] = await db.insert(brands).values(payload).returning();
    if (!created) throw new BadRequestError("Failed to create brand");
    return c.json(created, 201);
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
                    schema: UpdateBrandSchema,
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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(updateBrandRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const payload = {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.tagline !== undefined ? { tagline: body.tagline ?? null } : {}),
        ...(body.description !== undefined ? { description: body.description ?? null } : {}),
        ...(body.website !== undefined ? { website: body.website ?? null } : {}),
        ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl ?? null } : {}),
        ...(body.coverImageUrl !== undefined ? { coverImageUrl: body.coverImageUrl ?? null } : {}),
        ...(body.whyWeLoveIt !== undefined ? { whyWeLoveIt: body.whyWeLoveIt ?? null } : {}),
        ...(body.isVerified !== undefined ? { isVerified: body.isVerified } : {}),
        ...(body.metaTitle !== undefined ? { metaTitle: body.metaTitle ?? null } : {}),
        ...(body.metaDescription !== undefined ? { metaDescription: body.metaDescription ?? null } : {}),
    };

    const [updated] = await db
        .update(brands)
        .set(payload)
        .where(eq(brands.id, id))
        .returning();

    if (!updated) {
        throw new BadRequestError("Brand not found");
    }

    return c.json(updated, 200);
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

    // Delete collection-deal associations first
    await db.delete(collectionDeals).where(eq(collectionDeals.collectionId, id));

    // Delete collection
    const [deleted] = await db.delete(collections).where(eq(collections.id, id)).returning();

    if (!deleted) {
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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(addDealToCollectionRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

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
    const { messages } = c.req.valid("json");

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

    await invalidateKV((c.env as { KV?: KVNamespace }).KV, "settings:ticker");

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
                    schema: CreateCategorySchema,
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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(createCategoryRoute, async (c) => {
    const body = c.req.valid("json");

    const payload = {
        name: body.name,
        slug: body.slug,
        icon: body.icon ?? null,
        color: body.color ?? null,
        coverImageUrl: body.coverImageUrl ?? null,
        displayOrder: body.displayOrder ?? 0,
        metaTitle: body.metaTitle ?? null,
        metaDescription: body.metaDescription ?? null,
    };

    const [created] = await db.insert(categories).values(payload).returning();
    if (!created) throw new BadRequestError("Failed to create category");
    await invalidateKV((c.env as { KV?: KVNamespace }).KV, "categories:all");
    return c.json(created, 201);
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
                    schema: UpdateCategorySchema,
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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(updateCategoryRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const payload = {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.icon !== undefined ? { icon: body.icon ?? null } : {}),
        ...(body.color !== undefined ? { color: body.color ?? null } : {}),
        ...(body.coverImageUrl !== undefined ? { coverImageUrl: body.coverImageUrl ?? null } : {}),
        ...(body.displayOrder !== undefined ? { displayOrder: body.displayOrder } : {}),
        ...(body.metaTitle !== undefined ? { metaTitle: body.metaTitle ?? null } : {}),
        ...(body.metaDescription !== undefined ? { metaDescription: body.metaDescription ?? null } : {}),
    };

    const [updated] = await db
        .update(categories)
        .set(payload)
        .where(eq(categories.id, id))
        .returning();

    if (!updated) {
        throw new BadRequestError("Category not found");
    }

    await invalidateKV((c.env as { KV?: KVNamespace }).KV, "categories:all");

    return c.json(updated, 200);
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
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(deleteCategoryRoute, async (c) => {
    const { id } = c.req.valid("param");

    const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning();

    if (!deleted) {
        throw new BadRequestError("Category not found");
    }

    await invalidateKV((c.env as { KV?: KVNamespace }).KV, "categories:all");

    return c.json({ success: true }, 200);
});

const listCategoriesRoute = createRoute({
    method: "get",
    path: "/categories",
    tags: ["Admin"],
    summary: "List Categories (Admin)",
    description: "Get all categories (Admin only).",
    responses: {
        200: {
            description: "List of categories",
            content: {
                "application/json": {
                    schema: z.object({
                        categories: z.array(z.any()),
                    }),
                },
            },
        },
    },
});

app.openapi(listCategoriesRoute, async (c) => {
    const results = await db.select().from(categories).orderBy(categories.displayOrder);
    return c.json({ categories: results }, 200);
});

const listUsersRoute = createRoute({
    method: "get",
    path: "/users",
    tags: ["Admin"],
    summary: "List Users (Admin)",
    description: "Get all users (Admin only).",
    responses: {
        200: {
            description: "List of users",
            content: {
                "application/json": {
                    schema: z.object({
                        users: z.array(z.any()),
                    }),
                },
            },
        },
    },
});

app.openapi(listUsersRoute, async (c) => {
    // Requires importing user from the db schema.
    // However, user is imported via @uni-perks/auth or schema. Wait, let's just query from the DB.
    // The user schema isn't exported in the top-level db imports yet in this file, we'll need to add it.
    // Alternatively, we can use sql queries.
    // Actually, let's add the import to the top of the file in another chunk.
    const results = await db.select().from(user).orderBy(desc(user.createdAt));
    return c.json({ users: results }, 200);
});

export default app;
