import { db, deals, brands, categories, regions, tags, dealRegions, dealTags, eq, and, desc, ilike, inArray, sql } from "@uni-perks/db";
import { NotFoundError } from "../lib/errors";

export interface FindManyDealsOptions {
    categorySlug?: string;
    collectionId?: string;
    featured?: boolean;
    isActive?: boolean;
    regionCode?: string;
    searchQuery?: string;
    limit?: number;
    offset?: number;
}

export async function findManyDeals(options: FindManyDealsOptions) {
    const {
        categorySlug,
        collectionId,
        featured,
        isActive = true,
        regionCode,
        searchQuery,
        limit = 50,
        offset = 0,
    } = options;

    let query = db
        .select({
            deal: deals,
            brand: brands,
            category: categories,
        })
        .from(deals)
        .innerJoin(brands, eq(deals.brandId, brands.id))
        .innerJoin(categories, eq(deals.categoryId, categories.id))
        .$dynamic();

    const conditions = [];

    if (isActive !== undefined) {
        conditions.push(eq(deals.isActive, isActive));
    }

    if (featured !== undefined) {
        conditions.push(eq(deals.isFeatured, featured));
    }

    if (categorySlug) {
        conditions.push(eq(categories.slug, categorySlug));
    }

    if (searchQuery) {
        conditions.push(ilike(deals.title, `%${searchQuery}%`));
    }

    if (conditions.length > 0) {
        query = query.where(and(...conditions));
    }

    // If collectionId specified, filter by collection
    if (collectionId) {
        // Need to import collectionDeals at the top of the file
        // For now, doing it within the module scope using dynamic import or assuming it's exported
        const { collectionDeals } = await import("@uni-perks/db");

        const dealIdsInCollection = await db
            .select({ dealId: collectionDeals.dealId })
            .from(collectionDeals)
            .where(eq(collectionDeals.collectionId, collectionId));

        const ids = dealIdsInCollection.map(d => d.dealId);
        if (ids.length > 0) {
            query = query.where(inArray(deals.id, ids));
        } else {
            // Force 0 results if collection has no deals
            query = query.where(inArray(deals.id, []));
        }
    }

    // If regionCode specified, filter by region
    if (regionCode) {
        const regionResult = await db.select().from(regions).where(eq(regions.code, regionCode)).limit(1);
        if (regionResult[0]) {
            const dealIds = await db
                .select({ dealId: dealRegions.dealId })
                .from(dealRegions)
                .where(eq(dealRegions.regionId, regionResult[0].id));

            const ids = dealIds.map(d => d.dealId);
            if (ids.length > 0) {
                query = query.where(inArray(deals.id, ids));
            }
        }
    }

    const results = await query
        .orderBy(desc(deals.popularity))
        .limit(limit)
        .offset(offset);

    return results;
}

export async function findDealBySlug(slug: string) {
    const result = await db
        .select({
            deal: deals,
            brand: brands,
            category: categories,
        })
        .from(deals)
        .innerJoin(brands, eq(deals.brandId, brands.id))
        .innerJoin(categories, eq(deals.categoryId, categories.id))
        .where(eq(deals.slug, slug))
        .limit(1);

    if (!result[0]) {
        throw new NotFoundError("Deal not found");
    }

    // Get tags for this deal
    const dealTagsResult = await db
        .select({ tag: tags })
        .from(dealTags)
        .innerJoin(tags, eq(dealTags.tagId, tags.id))
        .where(eq(dealTags.dealId, result[0].deal.id));

    // Get regions for this deal
    const dealRegionsResult = await db
        .select({ region: regions })
        .from(dealRegions)
        .innerJoin(regions, eq(dealRegions.regionId, regions.id))
        .where(eq(dealRegions.dealId, result[0].deal.id));

    return {
        ...result[0],
        tags: dealTagsResult.map(t => t.tag),
        regions: dealRegionsResult.map(r => r.region),
    };
}

export async function incrementDealViewCount(dealId: string) {
    await db
        .update(deals)
        .set({ viewCount: sql`${deals.viewCount} + 1` })
        .where(eq(deals.id, dealId));
}

export async function incrementDealClickCount(dealId: string) {
    await db
        .update(deals)
        .set({ clickCount: sql`${deals.clickCount} + 1` })
        .where(eq(deals.id, dealId));
}
