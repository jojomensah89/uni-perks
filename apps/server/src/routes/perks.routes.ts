import { Hono } from "hono";
import { getPerks, getPerkDetail, trackPerkView } from "../services/perk.service";
import { getGeoData } from "../services/geo.service";
import { getCountryName, getRegionFromCountry } from "../utils/geo.utils";
import { BadRequestError } from "../lib/errors";

const app = new Hono();

/**
 * GET /api/perks
 * Get filtered and sorted perks
 */
app.get("/", async (c) => {
    const geoData = getGeoData(c.req.raw);
    const requestedCountry = c.req.query("country") || geoData.country;
    const categorySlug = c.req.query("category");
    const featured = c.req.query("featured") === "true";
    const region = c.req.query("region");
    const showGlobalOnly = c.req.query("global") === "true";
    const searchQuery = c.req.query("q");

    const perks = await getPerks({
        country: requestedCountry,
        categorySlug,
        featured,
        globalOnly: showGlobalOnly,
        region,
        searchQuery,
    });

    return c.json({
        perks,
        meta: {
            total: perks.length,
            country: requestedCountry,
            countryName: getCountryName(requestedCountry),
            region: getRegionFromCountry(requestedCountry),
        },
    });
});

/**
 * GET /api/perks/:slug
 * Get perk detail with country-specific data
 */
app.get("/:slug", async (c) => {
    const slug = c.req.param("slug");

    if (!slug) {
        throw new BadRequestError("Perk slug is required");
    }
    const geoData = getGeoData(c.req.raw);
    const country = c.req.query("country") || geoData.country;

    const result = await getPerkDetail({ slug, country });

    // Track view asynchronously (fire and forget)
    c.executionCtx.waitUntil(trackPerkView(result.perk.id));

    return c.json(result);
});

export default app;
