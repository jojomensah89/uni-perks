import { db, brands, deals, eq, and, desc } from "@uni-perks/db";
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

    // Get all deals for this brand
    const brandDeals = await db
        .select()
        .from(deals)
        .where(and(eq(deals.brandId, result[0].id), eq(deals.isActive, true)))
        .orderBy(desc(deals.popularity));

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
