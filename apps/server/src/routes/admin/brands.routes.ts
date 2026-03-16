import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db, brands, eq } from "@uni-perks/db";
import { BadRequestError } from "../../lib/errors";
import {
  CreateBrandSchema,
  UpdateBrandSchema,
} from "../../schemas/admin.schemas";

const app = new OpenAPIHono();

const BrandSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  isVerified: z.boolean().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  createdAt: z.string().optional(),
});

const listBrandsRoute = createRoute({
  method: "get",
  path: "/brands",
  tags: ["Admin"],
  summary: "List Brands (Admin)",
  description: "Get all brands (Admin only).",
  responses: {
    200: {
      description: "List of brands",
      content: {
        "application/json": {
          schema: z.object({
            brands: z.array(BrandSchema),
          }),
        },
      },
    },
  },
});

app.openapi(listBrandsRoute, async (c) => {
  const results = await db.select().from(brands).orderBy(brands.name);
  return c.json({ brands: results }, 200);
});

const createBrandRoute = createRoute({
  method: "post",
  path: "/brands",
  tags: ["Admin"],
  summary: "Create Brand (Admin)",
  description: "Create a new brand (Admin only).",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateBrandSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Brand created",
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

app.openapi(createBrandRoute, async (c) => {
  const body = c.req.valid("json");

  const payload = {
    name: body.name,
    slug: body.slug,
    tagline: body.tagline ?? null,
    description: body.description ?? null,
    website: body.website ?? null,
    logoUrl: body.logoUrl ?? null,
    coverImageUrl: body.coverImageUrl ?? null,
    whyWeLoveIt: body.whyWeLoveIt ?? null,
    isVerified: body.isVerified ?? false,
    metaTitle: body.metaTitle ?? null,
    metaDescription: body.metaDescription ?? null,
  };

  const [created] = await db.insert(brands).values(payload).returning();
  if (!created) throw new BadRequestError("Failed to create brand");
  return c.json(created, 201);
});

const updateBrandRoute = createRoute({
  method: "patch",
  path: "/brands/{id}",
  tags: ["Admin"],
  summary: "Update Brand (Admin)",
  description: "Update a brand (Admin only).",
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateBrandSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Brand updated",
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

app.openapi(updateBrandRoute, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");

  const payload = {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.tagline !== undefined ? { tagline: body.tagline ?? null } : {}),
    ...(body.description !== undefined
      ? { description: body.description ?? null }
      : {}),
    ...(body.website !== undefined ? { website: body.website ?? null } : {}),
    ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl ?? null } : {}),
    ...(body.coverImageUrl !== undefined
      ? { coverImageUrl: body.coverImageUrl ?? null }
      : {}),
    ...(body.whyWeLoveIt !== undefined
      ? { whyWeLoveIt: body.whyWeLoveIt ?? null }
      : {}),
    ...(body.isVerified !== undefined ? { isVerified: body.isVerified } : {}),
    ...(body.metaTitle !== undefined
      ? { metaTitle: body.metaTitle ?? null }
      : {}),
    ...(body.metaDescription !== undefined
      ? { metaDescription: body.metaDescription ?? null }
      : {}),
  };

  const [updated] = await db
    .update(brands)
    .set(payload)
    .where(eq(brands.id, id))
    .returning();

  if (!updated) {
    throw new BadRequestError("Brand not found");
  }

  return c.json(updated, 200);
});

export default app;
