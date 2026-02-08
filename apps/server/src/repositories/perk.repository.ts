import { db, perks, categories, eq, and, sql } from "@uni-perks/db";
import { NotFoundError } from "../lib/errors";
import { tryCatch } from "../lib/async-handler";

export interface PerkFilters {
    categorySlug?: string;
    featured?: boolean;
    isActive?: boolean;
    slug?: string;
    region?: string;
}

/**
 * Find perks with optional filters
 */
export async function findManyPerks(filters: PerkFilters = {}) {
    return tryCatch(async () => {
        const conditions = [];

        if (filters.isActive !== undefined) {
            conditions.push(eq(perks.isActive, filters.isActive));
        }

        if (filters.categorySlug) {
            conditions.push(eq(categories.slug, filters.categorySlug));
        }

        if (filters.region) {
            conditions.push(eq(perks.region, filters.region));
        }

        if (filters.featured) {
            conditions.push(eq(perks.isFeatured, filters.featured));
        }

        const query = db
            .select({
                perk: perks,
                category: categories,
            })
            .from(perks)
            .leftJoin(categories, eq(perks.categoryId, categories.id));

        if (conditions.length > 0) {
            query.where(and(...conditions));
        }

        return await query.all();
    }, "Failed to fetch perks");
}

/**
 * Find a single perk by slug
 */
export async function findPerkBySlug(slug: string) {
    return tryCatch(async () => {
        const result = await db
            .select({
                perk: perks,
                category: categories,
            })
            .from(perks)
            .leftJoin(categories, eq(perks.categoryId, categories.id))
            .where(and(eq(perks.slug, slug), eq(perks.isActive, true)))
            .get();

        if (!result) {
            throw new NotFoundError("Perk");
        }

        return result;
    }, `Failed to fetch perk: ${slug}`);
}

/**
 * Increment view count for a perk
 */
export async function incrementPerkViewCount(perkId: string) {
    return tryCatch(async () => {
        return await db
            .update(perks)
            .set({
                viewCount: sql`${perks.viewCount} + 1`,
                updatedAt: new Date(),
            })
            .where(eq(perks.id, perkId))
            .run();
    }, `Failed to increment view count for perk: ${perkId}`);
}

/**
 * Increment click count for a perk
 */
export async function incrementPerkClickCount(perkId: string) {
    return tryCatch(async () => {
        return await db
            .update(perks)
            .set({
                clickCount: sql`${perks.clickCount} + 1`,
                updatedAt: new Date(),
            })
            .where(eq(perks.id, perkId))
            .run();
    }, `Failed to increment click count for perk: ${perkId}`);
}
