import { Hono } from "hono";
import { getGeoData } from "../services/geo.service";

const app = new Hono();

/**
 * GET /api/geo
 * Get geo data from request headers
 */
app.get("/", (c) => {
    const geoData = getGeoData(c.req.raw);
    return c.json(geoData);
});

export default app;
