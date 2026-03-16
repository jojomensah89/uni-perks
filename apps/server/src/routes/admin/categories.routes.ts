import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db, categories, eq } from "@uni-perks/db";
import { BadRequestError } from "../../lib/errors";
import { invalidateKV } from "../../lib/kv-cache";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
} from "../../schemas/admin.schemas";

const app = new OpenAPIHono();

const createCategoryRoute = createRoute({
  method: "post",
  path: "/categories",
  tags: ["Admin"],
  summary: "Create Category (Admin)",
  description: "Create a new category (Admin only).",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateCategorySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Category created",
      content: { "application/json": { schema: z.any() } },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
  },
});

app.openapi(createCategoryRoute, async (c) => {
  const body = c.req.valid("json");

  const payload = {
    name: body.name,
    slug: body.slug,
    icon: body.icon ?? null,
    color: body.color ?? null,
    coverImageUrl: body.coverImageUrl ?? null,
    displayOrder: body.displayOrder ?? 0,
    metaTitle: body.metaTitle ?? null,
    metaDescription: body.metaDescription ?? null,
  };

  const [created] = await db.insert(categories).values(payload).returning();
  if (!created) throw new BadRequestError("Failed to create category");
  await invalidateKV((c.env as { KV?: KVNamespace }).KV, "categories:all");
  return c.json(created, 201);
});

const updateCategoryRoute = createRoute({
  method: "patch",
  path: "/categories/{id}",
  tags: ["Admin"],
  summary: "Update Category (Admin)",
  description: "Update a category (Admin only).",
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateCategorySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Category updated",
      content: { "application/json": { schema: z.any() } },
    },
    400: {
      description: "Not found",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
  },
});

app.openapi(updateCategoryRoute, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");

  const payload = {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.icon !== undefined ? { icon: body.icon ?? null } : {}),
    ...(body.color !== undefined ? { color: body.color ?? null } : {}),
    ...(body.coverImageUrl !== undefined
      ? { coverImageUrl: body.coverImageUrl ?? null }
      : {}),
    ...(body.displayOrder !== undefined
      ? { displayOrder: body.displayOrder }
      : {}),
    ...(body.metaTitle !== undefined
      ? { metaTitle: body.metaTitle ?? null }
      : {}),
    ...(body.metaDescription !== undefined
      ? { metaDescription: body.metaDescription ?? null }
      : {}),
  };

  const [updated] = await db
    .update(categories)
    .set(payload)
    .where(eq(categories.id, id))
    .returning();

  if (!updated) {
    throw new BadRequestError("Category not found");
  }

  await invalidateKV((c.env as { KV?: KVNamespace }).KV, "categories:all");

  return c.json(updated, 200);
});

const deleteCategoryRoute = createRoute({
  method: "delete",
  path: "/categories/{id}",
  tags: ["Admin"],
  summary: "Delete Category (Admin)",
  description: "Delete a category (Admin only).",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Category deleted",
      content: {
        "application/json": { schema: z.object({ success: z.boolean() }) },
      },
    },
    400: {
      description: "Not found",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
  },
});

app.openapi(deleteCategoryRoute, async (c) => {
  const { id } = c.req.valid("param");

  const [deleted] = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning();

  if (!deleted) {
    throw new BadRequestError("Category not found");
  }

  await invalidateKV((c.env as { KV?: KVNamespace }).KV, "categories:all");

  return c.json({ success: true }, 200);
});

const listCategoriesRoute = createRoute({
  method: "get",
  path: "/categories",
  tags: ["Admin"],
  summary: "List Categories (Admin)",
  description: "Get all categories (Admin only).",
  responses: {
    200: {
      description: "List of categories",
      content: {
        "application/json": {
          schema: z.object({
            categories: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                slug: z.string(),
                icon: z.string().nullable().optional(),
                color: z.string().nullable().optional(),
                coverImageUrl: z.string().nullable().optional(),
                displayOrder: z.number().nullable().optional(),
              }),
            ),
          }),
        },
      },
    },
  },
});

app.openapi(listCategoriesRoute, async (c) => {
  const results = await db
    .select()
    .from(categories)
    .orderBy(categories.displayOrder);
  return c.json({ categories: results }, 200);
});

export default app;
