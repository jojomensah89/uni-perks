import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db, deals, brands, categories, dealGeoConfig, eq, and, desc } from "@uni-perks/db";
import { BadRequestError } from "../../lib/errors";
import { CreateDealSchema, UpdateDealSchema } from "../../schemas/admin.schemas";
import { normalizeConditions, normalizeExpirationDate } from "./shared";

const app = new OpenAPIHono();

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
                        deals: z.array(z.any()),
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

export default app;
