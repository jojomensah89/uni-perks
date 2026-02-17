import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db, dealSuggestions, eq } from '@uni-perks/db';

const app = new OpenAPIHono();

const SuggestionSchema = z.object({
    id: z.string().optional(),
    brandName: z.string(),
    dealTitle: z.string(),
    description: z.string().min(10),
    discountLabel: z.string(),
    claimUrl: z.string().url(),
    category: z.string().optional(),
    source: z.enum(['ai', 'user']).optional(),
    submittedBy: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

const createSuggestionRoute = createRoute({
    method: "post",
    path: "/",
    tags: ["Suggestions"],
    summary: "Submit Suggestion",
    description: "Submit a new deal suggestion.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: SuggestionSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: "Suggestion created",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                        suggestion: z.any(),
                    }),
                },
            },
        },
        400: {
            description: "Invalid request",
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(createSuggestionRoute, async (c) => {
    const body = c.req.valid("json");

    const data = {
        brandName: body.brandName,
        dealTitle: body.dealTitle,
        description: body.description,
        discountLabel: body.discountLabel,
        claimUrl: body.claimUrl,
        category: body.category,
        source: body.source || 'user',
        submittedBy: body.submittedBy,
    };

    const [suggestion] = await db.insert(dealSuggestions).values(data).returning();

    return c.json({ success: true, suggestion }, 201);
});

const listSuggestionsRoute = createRoute({
    method: "get",
    path: "/",
    tags: ["Suggestions"],
    summary: "List Suggestions",
    description: "Get a list of deal suggestions.",
    request: {
        query: z.object({
            status: z.enum(['pending', 'approved', 'rejected']).optional(),
            source: z.enum(['ai', 'user']).optional(),
            limit: z.string().optional().default("50"),
            offset: z.string().optional().default("0"),
        }),
    },
    responses: {
        200: {
            description: "List of suggestions",
            content: {
                "application/json": {
                    schema: z.object({
                        suggestions: z.array(z.any()),
                        count: z.number(),
                    }),
                },
            },
        },
    },
});

app.openapi(listSuggestionsRoute, async (c) => {
    const query = c.req.valid("query");

    // Manual casting for these enums because valid('query') returns optional strings or specific types
    // but the DB query expects strong types.
    const status = query.status as 'pending' | 'approved' | 'rejected' | undefined;
    const source = query.source as 'ai' | 'user' | undefined;
    const limit = parseInt(query.limit || "50");
    const offset = parseInt(query.offset || "0");

    let dbQuery = db.select().from(dealSuggestions);

    // Apply filters
    if (status) {
        dbQuery = dbQuery.where(eq(dealSuggestions.status, status)) as any;
    } else {
        // Default to pending for public
        dbQuery = dbQuery.where(eq(dealSuggestions.status, 'pending')) as any;
    }

    if (source) {
        dbQuery = dbQuery.where(eq(dealSuggestions.source, source)) as any;
    }

    const suggestions = await dbQuery.limit(limit).offset(offset);

    return c.json({ suggestions, count: suggestions.length }, 200);
});

const getSuggestionRoute = createRoute({
    method: "get",
    path: "/{id}",
    tags: ["Suggestions"],
    summary: "Get Suggestion",
    description: "Get a single suggestion by ID.",
    request: {
        params: z.object({
            id: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Suggestion details",
            content: { "application/json": { schema: z.object({ suggestion: z.any() }) } }
        },
        404: {
            description: "Not found",
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    },
});

app.openapi(getSuggestionRoute, async (c) => {
    const { id } = c.req.valid("param");

    const [suggestion] = await db
        .select()
        .from(dealSuggestions)
        .where(eq(dealSuggestions.id, id))
        .limit(1);

    if (!suggestion) {
        return c.json({ error: 'Suggestion not found' }, 404);
    }

    return c.json({ suggestion }, 200);
});

export default app;
