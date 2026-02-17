import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getAllCategories } from "../services/category.service";

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

export default app;
