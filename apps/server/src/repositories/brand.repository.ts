import { db, brands, deals, categories, eq, and, desc } from "@uni-perks/db";
import { NotFoundError } from "../lib/errors";

export async function findBrandBySlug(slug: string) {
    const result = await db
        .select()
        .from(brands)
        .where(eq(brands.slug, slug))
        .limit(1);

    if (!result[0]) {
        throw new NotFoundError("Brand not found");
    }

    // Get all deals for this brand with brand and category info (for DealCardLink format)
    const brandDeals = await db
        .select({
            deal: deals,
            brand: brands,
            category: categories,
        })
        .from(deals)
        .innerJoin(brands, eq(deals.brandId, brands.id))
        .innerJoin(categories, eq(deals.categoryId, categories.id))
        .where(and(eq(deals.brandId, result[0].id), eq(deals.status, "published")))
        .orderBy(desc(deals.clickCount), desc(deals.viewCount));

    return {
        brand: result[0],
        deals: brandDeals,
    };
}

export async function findAllBrands() {
    return await db
        .select()
        .from(brands)
        .where(eq(brands.isVerified, true))
        .orderBy(brands.name);
}
