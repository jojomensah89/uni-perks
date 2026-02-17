import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getBrandBySlug, getAllBrands } from "../services/brand.service";
import { BadRequestError } from "../lib/errors";

const app = new OpenAPIHono();

const BrandSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    tagline: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
    coverImageUrl: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    isVerified: z.boolean().nullable().optional(),
    // Add other fields as needed
});

const BrandsListResponseSchema = z.object({
    brands: z.array(BrandSchema),
});

const listBrandsRoute = createRoute({
    method: "get",
    path: "/",
    tags: ["Brands"],
    summary: "List Brands",
    description: "Get a list of all verified brands.",
    responses: {
        200: {
            description: "List of brands",
            content: {
                "application/json": {
                    schema: BrandsListResponseSchema,
                },
            },
        },
    },
});

app.openapi(listBrandsRoute, async (c) => {
    const brands = await getAllBrands();
    return c.json({ brands }, 200);
});

const getBrandRoute = createRoute({
    method: "get",
    path: "/{slug}",
    tags: ["Brands"],
    summary: "Get Brand",
    description: "Get brand details and its associated deals.",
    request: {
        params: z.object({
            slug: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Brand details",
            content: {
                "application/json": {
                    schema: z.any(), // Flexible schema for brand + deals
                },
            },
        },
        400: {
            description: "Bad Request",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(getBrandRoute, async (c) => {
    const { slug } = c.req.valid("param");

    if (!slug) {
        throw new BadRequestError("Brand slug is required");
    }

    const result = await getBrandBySlug(slug);
    return c.json(result, 200);
});

export default app;
