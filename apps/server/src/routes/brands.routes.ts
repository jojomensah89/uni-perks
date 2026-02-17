import { Hono } from "hono";
import { getBrandBySlug, getAllBrands } from "../services/brand.service";
import { BadRequestError } from "../lib/errors";

const app = new Hono();

/**
 * GET /api/brands
 * Get all verified brands
 */
app.get("/", async (c) => {
    const brands = await getAllBrands();
    return c.json({ brands });
});

/**
 * GET /api/brands/:slug
 * Get brand detail with all deals
 */
app.get("/:slug", async (c) => {
    const slug = c.req.param("slug");

    if (!slug) {
        throw new BadRequestError("Brand slug is required");
    }

    const result = await getBrandBySlug(slug);
    return c.json(result);
});

export default app;
