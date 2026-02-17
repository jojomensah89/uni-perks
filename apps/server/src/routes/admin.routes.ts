import { Hono } from "hono";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";
import { BadRequestError } from "../lib/errors";
import { db, deals, brands, categories, eq, desc } from "@uni-perks/db";

const app = new Hono();

// Apply auth middleware to all admin routes
app.use("*", requireAuth, requireAdmin);

/**
 * GET /api/admin/deals
 * Get all deals (including inactive) with pagination
 */
app.get("/deals", async (c) => {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = (page - 1) * limit;

    const results = await db
        .select({
            deal: deals,
            brand: brands,
            category: categories,
        })
        .from(deals)
        .innerJoin(brands, eq(deals.brandId, brands.id))
        .innerJoin(categories, eq(deals.categoryId, categories.id))
        .orderBy(desc(deals.createdAt))
        .limit(limit)
        .offset(offset);

    return c.json({ deals: results, page, limit });
});

/**
 * GET /api/admin/deals/:id
 * Get single deal by ID
 */
app.get("/deals/:id", async (c) => {
    const id = c.req.param("id");

    const result = await db
        .select({
            deal: deals,
            brand: brands,
            category: categories,
        })
        .from(deals)
        .innerJoin(brands, eq(deals.brandId, brands.id))
        .innerJoin(categories, eq(deals.categoryId, categories.id))
        .where(eq(deals.id, id))
        .limit(1);

    if (!result[0]) {
        throw new BadRequestError("Deal not found");
    }

    return c.json(result[0]);
});

/**
 * POST /api/admin/deals
 * Create a new deal
 */
app.post("/deals", async (c) => {
    const body = await c.req.json();

    if (!body.title || !body.brandId || !body.categoryId || !body.claimUrl || !body.verificationMethod) {
        throw new BadRequestError("Missing required fields");
    }

    const result = await db.insert(deals).values(body).returning();
    return c.json(result[0], 201);
});

/**
 * PATCH /api/admin/deals/:id
 * Update a deal
 */
app.patch("/deals/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();

    const result = await db
        .update(deals)
        .set(body)
        .where(eq(deals.id, id))
        .returning();

    if (!result[0]) {
        throw new BadRequestError("Deal not found");
    }

    return c.json(result[0]);
});

/**
 * DELETE /api/admin/deals/:id
 * Soft delete a deal
 */
app.delete("/deals/:id", async (c) => {
    const id = c.req.param("id");

    const result = await db
        .update(deals)
        .set({ isActive: false })
        .where(eq(deals.id, id))
        .returning();

    if (!result[0]) {
        throw new BadRequestError("Deal not found");
    }

    return c.json(result[0]);
});

/**
 * GET /api/admin/brands
 * Get all brands
 */
app.get("/brands", async (c) => {
    const results = await db.select().from(brands).orderBy(brands.name);
    return c.json({ brands: results });
});

/**
 * POST /api/admin/brands
 * Create a new brand
 */
app.post("/brands", async (c) => {
    const body = await c.req.json();

    if (!body.name || !body.slug) {
        throw new BadRequestError("Missing required fields");
    }

    const result = await db.insert(brands).values(body).returning();
    return c.json(result[0], 201);
});

/**
 * PATCH /api/admin/brands/:id
 * Update a brand
 */
app.patch("/brands/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();

    const result = await db
        .update(brands)
        .set(body)
        .where(eq(brands.id, id))
        .returning();

    if (!result[0]) {
        throw new BadRequestError("Brand not found");
    }

    return c.json(result[0]);
});

export default app;
