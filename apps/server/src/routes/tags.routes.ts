import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db } from "@uni-perks/db";
import { InternalServerError } from "../lib/errors";

const app = new OpenAPIHono();

const getTagsRoute = createRoute({
    method: "get",
    path: "/",
    tags: ["Tags"],
    summary: "List Tags",
    description: "Get a list of all active tags.",
    responses: {
        200: {
            description: "Successful response",
            content: {
                "application/json": {
                    schema: z.object({
                        tags: z.array(z.object({
                            id: z.string(),
                            name: z.string(),
                            slug: z.string(),
                            // Optional fields
                            description: z.string().nullable().optional(),
                            isActive: z.boolean().nullable().optional(),
                        }))
                    })
                }
            }
        },
        500: {
            description: "Internal Server Error",
            content: { "application/json": { schema: z.object({ error: z.string() }) } }
        }
    }
});

app.openapi(getTagsRoute, async (c) => {
    try {
        const allTags = await db.query.tags.findMany({
            orderBy: (tags, { desc }) => [desc(tags.createdAt)],
        });

        return c.json({ tags: allTags }, 200);
    } catch (error) {
        console.error("Error fetching tags:", error);
        throw new InternalServerError("Failed to fetch tags");
    }
});

export default app;
