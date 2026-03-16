import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db, deals, brands, categories, eq, desc } from "@uni-perks/db";
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
        isNewCustomerOnly: body.isNewCustomerOnly ?? false,
        status: body.status ?? "draft",
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
        ...(body.isNewCustomerOnly !== undefined ? { isNewCustomerOnly: body.isNewCustomerOnly } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
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
        .set({ status: "archived" })
        .where(eq(deals.id, id))
        .returning();

    if (!deleted) {
        throw new BadRequestError("Deal not found");
    }

    return c.json(deleted, 200);
});


export default app;
