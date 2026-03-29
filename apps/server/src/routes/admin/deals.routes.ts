import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db, deals, brands, categories, eq, desc, and } from "@uni-perks/db";
import { BadRequestError } from "../../lib/errors";
import { CreateDealSchema, UpdateDealSchema, ApproveDealSchema } from "../../schemas/admin.schemas";
import { normalizeConditions, normalizeExpiresAt } from "./shared";
import { invalidateKV } from "../../lib/kv-cache";
import { logInfo, logError } from "../../lib/logger";

const app = new OpenAPIHono();

type WorkerEnv = {
    KV?: KVNamespace;
};

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
            status: z.enum(["pending", "approved", "rejected", "published", "archived"]).optional(),
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
        currency: body.currency ?? "USD",
        claimUrl: body.claimUrl,
        affiliateLink: body.affiliateLink ?? null,
        coverImageUrl: body.coverImageUrl ?? null,
        howToRedeem: body.howToRedeem ?? null,
        termsUrl: body.termsUrl ?? null,
        minimumSpend: body.minimumSpend ?? null,
        isFeatured: body.isFeatured ?? false,
        status: body.status ?? "pending",
        hotnessScore: body.hotnessScore ?? 50,
        conditions: normalizeConditions(body.conditions),
        expiresAt: normalizeExpiresAt(body.expiresAt),
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
    const kv = (c.env as WorkerEnv).KV;

    const payload: Record<string, unknown> = {};

    if (body.title !== undefined) payload.title = body.title;
    if (body.shortDescription !== undefined) payload.shortDescription = body.shortDescription ?? "";
    if (body.longDescription !== undefined) payload.longDescription = body.longDescription ?? "";
    if (body.brandId !== undefined) payload.brandId = body.brandId;
    if (body.categoryId !== undefined) payload.categoryId = body.categoryId;
    if (body.discountType !== undefined) payload.discountType = body.discountType;
    if (body.discountLabel !== undefined) payload.discountLabel = body.discountLabel;
    if (body.discountValue !== undefined) payload.discountValue = body.discountValue ?? null;
    if (body.originalPrice !== undefined) payload.originalPrice = body.originalPrice ?? null;
    if (body.currency !== undefined) payload.currency = body.currency;
    if (body.claimUrl !== undefined) payload.claimUrl = body.claimUrl;
    if (body.affiliateLink !== undefined) payload.affiliateLink = body.affiliateLink ?? null;
    if (body.coverImageUrl !== undefined) payload.coverImageUrl = body.coverImageUrl ?? null;
    if (body.howToRedeem !== undefined) payload.howToRedeem = body.howToRedeem ?? null;
    if (body.termsUrl !== undefined) payload.termsUrl = body.termsUrl ?? null;
    if (body.minimumSpend !== undefined) payload.minimumSpend = body.minimumSpend ?? null;
    if (body.isFeatured !== undefined) payload.isFeatured = body.isFeatured;
    if (body.status !== undefined) payload.status = body.status;
    if (body.hotnessScore !== undefined) payload.hotnessScore = body.hotnessScore;
    if (body.conditions !== undefined) payload.conditions = normalizeConditions(body.conditions ?? null);
    if (body.expiresAt !== undefined) payload.expiresAt = normalizeExpiresAt(body.expiresAt);
    if (body.metaTitle !== undefined) payload.metaTitle = body.metaTitle ?? null;
    if (body.metaDescription !== undefined) payload.metaDescription = body.metaDescription ?? null;

    const [updated] = await db
        .update(deals)
        .set(payload)
        .where(eq(deals.id, id))
        .returning();

    if (!updated) {
        throw new BadRequestError("Deal not found");
    }

    if (body.status || body.isFeatured) {
        await invalidateKV(kv, "deals:featured").catch((err) => {
            logError("deals-route", "failed to invalidate cache", { message: String(err) });
        });
    }

    return c.json(updated, 200);
});

const approveDealRoute = createRoute({
    method: "post",
    path: "/deals/{id}/approve",
    tags: ["Admin"],
    summary: "Approve Deal (Admin)",
    description: "Approve a pending deal (Admin only).",
    request: {
        params: z.object({
            id: z.string(),
        }),
        body: {
            content: {
                "application/json": {
                    schema: ApproveDealSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Deal approved",
            content: { "application/json": { schema: z.any() } }
        },
        400: {
            description: "Not found or already approved",
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(approveDealRoute, async (c) => {
    const { id } = c.req.valid("param");
    const kv = (c.env as WorkerEnv).KV;

    const [updated] = await db
        .update(deals)
        .set({ 
            status: "approved",
            approvedAt: new Date(),
        })
        .where(and(
            eq(deals.id, id),
            eq(deals.status, "pending")
        ))
        .returning();

    if (!updated) {
        throw new BadRequestError("Deal not found or not pending");
    }

    await invalidateKV(kv, "deals:featured").catch((err) => {
        logError("deals-route", "failed to invalidate cache after approval", { message: String(err) });
    });

    logInfo("deals-route", "deal approved", { dealId: id });

    return c.json(updated, 200);
});

const rejectDealRoute = createRoute({
    method: "post",
    path: "/deals/{id}/reject",
    tags: ["Admin"],
    summary: "Reject Deal (Admin)",
    description: "Reject a pending deal (Admin only).",
    request: {
        params: z.object({
            id: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Deal rejected",
            content: { "application/json": { schema: z.any() } }
        },
        400: {
            description: "Not found or not pending",
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(rejectDealRoute, async (c) => {
    const { id } = c.req.valid("param");

    const [updated] = await db
        .update(deals)
        .set({ status: "rejected" })
        .where(and(
            eq(deals.id, id),
            eq(deals.status, "pending")
        ))
        .returning();

    if (!updated) {
        throw new BadRequestError("Deal not found or not pending");
    }

    logInfo("deals-route", "deal rejected", { dealId: id });

    return c.json(updated, 200);
});

const publishDealRoute = createRoute({
    method: "post",
    path: "/deals/{id}/publish",
    tags: ["Admin"],
    summary: "Publish Deal (Admin)",
    description: "Publish an approved deal (Admin only).",
    request: {
        params: z.object({
            id: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Deal published",
            content: { "application/json": { schema: z.any() } }
        },
        400: {
            description: "Not found or not approved",
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(publishDealRoute, async (c) => {
    const { id } = c.req.valid("param");
    const kv = (c.env as WorkerEnv).KV;

    const [updated] = await db
        .update(deals)
        .set({ status: "published" })
        .where(and(
            eq(deals.id, id),
            eq(deals.status, "approved")
        ))
        .returning();

    if (!updated) {
        throw new BadRequestError("Deal not found or not approved");
    }

    await invalidateKV(kv, "deals:featured").catch((err) => {
        logError("deals-route", "failed to invalidate cache after publish", { message: String(err) });
    });

    logInfo("deals-route", "deal published", { dealId: id });

    return c.json(updated, 200);
});

const deleteDealRoute = createRoute({
    method: "delete",
    path: "/deals/{id}",
    tags: ["Admin"],
    summary: "Delete Deal (Admin)",
    description: "Archive a deal (Admin only).",
    request: {
        params: z.object({
            id: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Deal archived",
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
    const kv = (c.env as WorkerEnv).KV;

    const [deleted] = await db
        .update(deals)
        .set({ status: "archived" })
        .where(eq(deals.id, id))
        .returning();

    if (!deleted) {
        throw new BadRequestError("Deal not found");
    }

    await invalidateKV(kv, "deals:featured").catch((err) => {
        logError("deals-route", "failed to invalidate cache after archive", { message: String(err) });
    });

    return c.json(deleted, 200);
});


export default app;
