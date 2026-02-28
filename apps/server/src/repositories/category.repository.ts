import { db, categories, deals, brands, eq, and, desc } from "@uni-perks/db";
import { NotFoundError } from "../lib/errors";

/**
 * Get all categories
 */
export async function findAllCategories() {
    return await db
        .select()
        .from(categories)
        .orderBy(categories.displayOrder);
}

/**
 * Find category by slug with deals
 */
export async function findCategoryBySlug(slug: string) {
    const result = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1);

    if (!result[0]) {
        throw new NotFoundError("Category not found");
    }

    // Get all deals for this category with brand and category info
    const categoryDeals = await db
        .select({
            deal: deals,
            brand: brands,
            category: categories,
        })
        .from(deals)
        .innerJoin(brands, eq(deals.brandId, brands.id))
        .innerJoin(categories, eq(deals.categoryId, categories.id))
        .where(and(eq(deals.categoryId, result[0].id), eq(deals.isActive, true)))
        .orderBy(desc(deals.popularity));

    return {
        category: result[0],
        deals: categoryDeals,
    };
}
