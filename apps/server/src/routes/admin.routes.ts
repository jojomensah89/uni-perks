import { Hono } from "hono";
import { adminService } from "../services/admin.service";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";
import { BadRequestError } from "../lib/errors";

const app = new Hono();

// Apply auth middleware to all admin routes
app.use("*", requireAuth, requireAdmin);

/**
 * GET /api/admin/perks
 * Get all perks (including inactive) with pagination
 */
app.get("/perks", async (c) => {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "50");
    const sortBy = c.req.query("sortBy") as "createdAt" | "updatedAt" | "viewCount" | "clickCount" | undefined;
    const sortOrder = c.req.query("sortOrder") as "asc" | "desc" | undefined;

    const result = await adminService.getAllPerks({
        page,
        limit,
        sortBy,
        sortOrder,
    });

    return c.json(result);
});

/**
 * GET /api/admin/perks/:id
 * Get single perk by ID
 */
app.get("/perks/:id", async (c) => {
    const id = c.req.param("id");

    // Use the repository directly for single fetch
    const { db, perks, categories, eq } = await import("@uni-perks/db");

    const result = await db
        .select({ perk: perks, category: categories })
        .from(perks)
        .leftJoin(categories, eq(perks.categoryId, categories.id))
        .where(eq(perks.id, id))
        .get();

    if (!result) {
        throw new BadRequestError("Perk not found");
    }

    return c.json(result);
});

/**
 * POST /api/admin/perks
 * Create a new perk
 */
app.post("/perks", async (c) => {
    const body = await c.req.json();

    if (!body.title || !body.company || !body.claimUrl || !body.categoryId || !body.verificationMethod) {
        throw new BadRequestError("Missing required fields");
    }

    const result = await adminService.createPerk(body);
    return c.json(result, 201);
});

/**
 * PATCH /api/admin/perks/:id
 * Update a perk
 */
app.patch("/perks/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();

    const result = await adminService.updatePerk({
        id,
        ...body,
    });

    return c.json(result);
});

/**
 * DELETE /api/admin/perks/:id
 * Soft delete a perk
 */
app.delete("/perks/:id", async (c) => {
    const id = c.req.param("id");

    const result = await adminService.deletePerk(id);
    return c.json(result);
});

/**
 * POST /api/admin/perks/:id/feature
 * Toggle featured status
 */
app.post("/perks/:id/feature", async (c) => {
    const id = c.req.param("id");

    const result = await adminService.toggleFeatured(id);
    return c.json(result);
});

/**
 * POST /api/admin/perks/:id/expire
 * Set expiration date
 */
app.post("/perks/:id/expire", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();

    const expirationDate = body.expirationDate ? new Date(body.expirationDate) : null;

    const result = await adminService.setPerkExpiration(id, expirationDate);
    return c.json(result);
});

export default app;
