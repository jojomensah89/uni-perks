import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db, dealSuggestions, deals, and, eq, desc, sql } from "@uni-perks/db";
import { BadRequestError } from "../../lib/errors";
import { UpdateSuggestionSchema, ApproveSuggestionSchema } from "../../schemas/admin.schemas";
import { logInfo } from "../../lib/logger";

const app = new OpenAPIHono();

const listSuggestionsRoute = createRoute({
    method: "get",
    path: "/suggestions",
    tags: ["Admin"],
    summary: "List Deal Suggestions (Admin)",
    description: "Get all deal suggestions with pagination (Admin only).",
    request: {
        query: z.object({
            page: z.string().regex(/^\d+$/).optional().default("1"),
            limit: z.string().regex(/^\d+$/).refine((val) => parseInt(val) <= 100, "Maximum limit is 100").optional().default("50"),
            status: z.enum(["pending", "approved", "rejected"]).optional(),
            source: z.enum(["ai", "user"]).optional(),
        }),
    },
    responses: {
        200: {
            description: "List of suggestions",
            content: {
                "application/json": {
                    schema: z.object({
                        suggestions: z.array(z.any()),
                        page: z.number(),
                        limit: z.number(),
                    }),
                },
            },
        },
    },
});

app.openapi(listSuggestionsRoute, async (c) => {
    const query = c.req.valid("query");
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "50");
    const offset = (page - 1) * limit;

    const whereClauses = [];
    if (query.status) whereClauses.push(eq(dealSuggestions.status, query.status));
    if (query.source) whereClauses.push(eq(dealSuggestions.source, query.source));

    const results = await db
        .select()
        .from(dealSuggestions)
        .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
        .orderBy(desc(dealSuggestions.submittedAt))
        .limit(limit)
        .offset(offset);

    return c.json({ suggestions: results, page, limit }, 200);
});

const getSuggestionRoute = createRoute({
    method: "get",
    path: "/suggestions/{id}",
    tags: ["Admin"],
    summary: "Get Suggestion (Admin)",
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        200: {
            description: "Suggestion details",
            content: { "application/json": { schema: z.any() } }
        },
    },
});

app.openapi(getSuggestionRoute, async (c) => {
    const { id } = c.req.valid("param");
    const result = await db.select().from(dealSuggestions).where(eq(dealSuggestions.id, id)).limit(1);
    if (!result[0]) throw new BadRequestError("Suggestion not found");
    return c.json(result[0], 200);
});

const updateSuggestionRoute = createRoute({
    method: "patch",
    path: "/suggestions/{id}",
    tags: ["Admin"],
    summary: "Update Suggestion (Admin)",
    request: {
        params: z.object({ id: z.string() }),
        body: {
            content: {
                "application/json": {
                    schema: UpdateSuggestionSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Suggestion updated",
            content: { "application/json": { schema: z.any() } }
        },
    },
});

app.openapi(updateSuggestionRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const [updated] = await db
        .update(dealSuggestions)
        .set(body)
        .where(eq(dealSuggestions.id, id))
        .returning();

    if (!updated) throw new BadRequestError("Suggestion not found");
    return c.json(updated, 200);
});

const approveSuggestionRoute = createRoute({
    method: "post",
    path: "/suggestions/{id}/approve",
    tags: ["Admin"],
    summary: "Approve Suggestion (Admin)",
    description: "Convert a suggestion into a real deal.",
    request: {
        params: z.object({ id: z.string() }),
        body: {
            content: {
                "application/json": {
                    schema: ApproveSuggestionSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: "Deal created from suggestion",
            content: { "application/json": { schema: z.any() } }
        },
    },
});

app.openapi(approveSuggestionRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    // 1. Fetch the suggestion
    const [suggestion] = await db
        .select()
        .from(dealSuggestions)
        .where(eq(dealSuggestions.id, id))
        .limit(1);

    if (!suggestion || suggestion.status !== "pending") {
        throw new BadRequestError("Suggestion not found or not pending");
    }

    // 2. Create the deal
    const [newDeal] = await db.insert(deals).values({
        slug: body.slug,
        title: suggestion.dealTitle,
        shortDescription: suggestion.description.slice(0, 500),
        longDescription: suggestion.description,
        brandId: body.brandId,
        categoryId: body.categoryId,
        discountType: body.discountType,
        discountLabel: suggestion.discountLabel,
        discountValue: body.discountValue,
        claimUrl: suggestion.claimUrl,
        status: "published", // Default to published when approved by admin
        isFeatured: body.isFeatured,
    }).returning();

    // 3. Update suggestion status
    await db.update(dealSuggestions).set({
        status: "approved",
        reviewedAt: new Date(),
        reviewedBy: "admin", // Replace with actual admin ID if available
    }).where(eq(dealSuggestions.id, id));

    logInfo("suggestions-route", "suggestion approved and deal created", { suggestionId: id, dealId: newDeal?.id });

    return c.json(newDeal, 201);
});

const rejectSuggestionRoute = createRoute({
    method: "post",
    path: "/suggestions/{id}/reject",
    tags: ["Admin"],
    summary: "Reject Suggestion (Admin)",
    request: {
        params: z.object({ id: z.string() }),
        body: {
            content: {
                "application/json": {
                    schema: z.object({ reason: z.string().max(500).optional() }),
                },
            },
        },
    },
    responses: {
        200: {
            description: "Suggestion rejected",
            content: { "application/json": { schema: z.any() } }
        },
    },
});

app.openapi(rejectSuggestionRoute, async (c) => {
    const { id } = c.req.valid("param");
    const { reason } = c.req.valid("json");

    const [updated] = await db
        .update(dealSuggestions)
        .set({
            status: "rejected",
            rejectionReason: reason,
            reviewedAt: new Date(),
        })
        .where(and(eq(dealSuggestions.id, id), eq(dealSuggestions.status, "pending")))
        .returning();

    if (!updated) throw new BadRequestError("Suggestion not found or not pending");
    return c.json(updated, 200);
});

export default app;
