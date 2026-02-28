import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getAllCategories, getCategoryBySlug } from "../services/category.service";
import { BadRequestError } from "../lib/errors";

const app = new OpenAPIHono();

const CategorySchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    icon: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    coverImageUrl: z.string().nullable().optional(),
    displayOrder: z.number().nullable().optional(),
});

const CategoriesListResponseSchema = z.object({
    categories: z.array(CategorySchema),
});

const listCategoriesRoute = createRoute({
    method: "get",
    path: "/",
    tags: ["Categories"],
    summary: "List Categories",
    description: "Get a list of all categories.",
    responses: {
        200: {
            description: "List of categories",
            content: {
                "application/json": {
                    schema: CategoriesListResponseSchema,
                },
            },
        },
    },
});

app.openapi(listCategoriesRoute, async (c) => {
    const categories = await getAllCategories();
    return c.json({ categories }, 200);
});

const getCategoryRoute = createRoute({
    method: "get",
    path: "/{slug}",
    tags: ["Categories"],
    summary: "Get Category",
    description: "Get category details and its associated deals.",
    request: {
        params: z.object({
            slug: z.string(),
        }),
    },
    responses: {
        200: {
            description: "Category details",
            content: {
                "application/json": {
                    schema: z.any(), // Flexible schema for category + deals
                },
            },
        },
        400: {
            description: "Bad Request",
            content: { "application/json": { schema: z.object({ message: z.string() }) } }
        }
    },
});

app.openapi(getCategoryRoute, async (c) => {
    const { slug } = c.req.valid("param");

    if (!slug) {
        throw new BadRequestError("Category slug is required");
    }

    const result = await getCategoryBySlug(slug);
    return c.json(result, 200);
});

export default app;
