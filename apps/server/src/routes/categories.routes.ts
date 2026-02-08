import { Hono } from "hono";
import { getAllCategories } from "../services/category.service";

const app = new Hono();

/**
 * GET /api/categories
 * Get all categories
 */
app.get("/", async (c) => {
    const categories = await getAllCategories();
    return c.json({ categories });
});

export default app;
