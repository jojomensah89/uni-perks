import { Hono } from "hono";
import { getCollections, getCollectionBySlug } from "../services/collection.service";
import { BadRequestError } from "../lib/errors";

const app = new Hono();

/**
 * GET /api/collections
 * Get all collections (optionally featured only)
 */
app.get("/", async (c) => {
    const featured = c.req.query("featured") === "true";
    const collections = await getCollections({ featured });
    return c.json({ collections });
});

/**
 * GET /api/collections/:slug
 * Get collection detail with all deals
 */
app.get("/:slug", async (c) => {
    const slug = c.req.param("slug");

    if (!slug) {
        throw new BadRequestError("Collection slug is required");
    }

    const result = await getCollectionBySlug(slug);
    return c.json(result);
});

export default app;
