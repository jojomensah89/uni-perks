import { db, categories, eq } from "@uni-perks/db";
import { tryCatch } from "../lib/async-handler";

/**
 * Get all categories
 */
export async function findAllCategories() {
    return tryCatch(async () => {
        return await db.select().from(categories).all();
    }, "Failed to fetch categories");
}

/**
 * Find category by slug
 */
export async function findCategoryBySlug(slug: string) {
    return tryCatch(async () => {
        return await db
            .select()
            .from(categories)
            .where(eq(categories.slug, slug))
            .get();
    }, `Failed to fetch category: ${slug}`);
}
