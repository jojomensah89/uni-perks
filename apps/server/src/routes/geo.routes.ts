import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getGeoData, getRegions } from "../services/geo.service";

const app = new OpenAPIHono();

const GeoDataSchema = z.object({
    country: z.string(),
    region: z.string(),
    continent: z.string(),
    city: z.string().optional(),
});

const RegionSchema = z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    isActive: z.boolean().nullable().optional(),
    createdAt: z.string().optional(), // Date is often serialized to string
});

const RegionsResponseSchema = z.object({
    regions: z.array(RegionSchema),
});

const getGeoRoute = createRoute({
    method: "get",
    path: "/",
    tags: ["Geo"],
    summary: "Get Geo Data",
    description: "Get geographical data extracted from request headers.",
    responses: {
        200: {
            description: "Geo data",
            content: {
                "application/json": {
                    schema: GeoDataSchema,
                },
            },
        },
    },
});

app.openapi(getGeoRoute, (c) => {
    const geoData = getGeoData(c.req.raw);
    return c.json(geoData, 200);
});

const getRegionsRoute = createRoute({
    method: "get",
    path: "/regions",
    tags: ["Geo"],
    summary: "Get Regions",
    description: "Get a list of all available regions.",
    responses: {
        200: {
            description: "List of regions",
            content: {
                "application/json": {
                    schema: RegionsResponseSchema,
                },
            },
        },
    },
});

app.openapi(getRegionsRoute, async (c) => {
    const regions = await getRegions();
    return c.json({ regions }, 200);
});

export default app;
