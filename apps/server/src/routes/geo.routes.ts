import { Hono } from "hono";
import { getGeoData, getRegions } from "../services/geo.service";

const app = new Hono();

/**
 * GET /api/geo
 * Get geo data from request headers
 */
app.get("/", (c) => {
    const geoData = getGeoData(c.req.raw);
    return c.json(geoData);
});

/**
 * GET /api/geo/regions
 * Get all available regions
 */
app.get("/regions", async (c) => {
    const regions = await getRegions();
    return c.json({ regions });
});

export default app;
