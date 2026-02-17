import { Hono } from "hono";
import { getDeals, getDealDetail, trackDealView } from "../services/deal.service";
import { getGeoData } from "../services/geo.service";
import { BadRequestError } from "../lib/errors";

const app = new Hono();

/**
 * GET /api/deals
 * Get filtered and sorted deals
 */
app.get("/", async (c) => {
    const geoData = getGeoData(c.req.raw);
    const requestedCountry = c.req.query("country") || geoData.country;
    const categorySlug = c.req.query("category");
    const featured = c.req.query("featured") === "true";
    const regionCode = c.req.query("region");
    const searchQuery = c.req.query("q");
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = parseInt(c.req.query("offset") || "0");

    const results = await getDeals({
        country: requestedCountry,
        categorySlug,
        featured,
        regionCode,
        searchQuery,
        limit,
        offset,
    });

    return c.json({
        deals: results,
        meta: {
            total: results.length,
            country: requestedCountry,
            limit,
            offset,
        },
    });
});

/**
 * GET /api/deals/:slug
 * Get deal detail with tags and regions
 */
app.get("/:slug", async (c) => {
    const slug = c.req.param("slug");

    if (!slug) {
        throw new BadRequestError("Deal slug is required");
    }

    const geoData = getGeoData(c.req.raw);
    const country = c.req.query("country") || geoData.country;

    const result = await getDealDetail({ slug, country });

    // Track view asynchronously (fire and forget)
    c.executionCtx.waitUntil(trackDealView(result.deal.id));

    return c.json(result);
});

export default app;
