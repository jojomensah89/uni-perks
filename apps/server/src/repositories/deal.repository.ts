import { db, deals, brands, categories, regions, tags, dealRegions, dealTags, dealGeoConfig, clicks, eq, and, desc, inArray, sql } from "@uni-perks/db";
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
    brandId?: string;
    excludeDealId?: string;
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
        // Use FTS5 for full-text search across deal title, description, brand name, and category name
        // FTS5 provides better relevance ranking and performance than LIKE queries
        try {
            // Escape special FTS5 characters to prevent query errors
            // Use double quotes for phrases and * for prefix matching
            const escapedQuery = searchQuery.replace(/["]/g, '""');
            const ftsResults = await db.all(sql`
                SELECT rowid FROM deals_fts 
                WHERE deals_fts MATCH ${escapedQuery + '*'}
                ORDER BY rank
            `);

            const rowIds = ftsResults
                .map((result) => {
                    if (result && typeof result === "object" && "rowid" in result) {
                        return result.rowid;
                    }
                    return null;
                })
                .filter((value): value is number => value !== null);

            if (rowIds.length > 0) {
                // Map rowids back to internal IDs using a subquery or inArray
                // Since D1 rowid corresponds to deals table rowid (due to external content)
                conditions.push(sql`${deals.id} IN (SELECT id FROM deals WHERE rowid IN (${sql.join(rowIds, sql`, `)}))`);
            } else {
                // No FTS matches, force empty results
                conditions.push(sql`1 = 0`);
            }
        } catch (error) {
            console.error("FTS search failed, falling back to LIKE:", error);
            // Fallback to simple LIKE search if FTS fails
            const pattern = `%${searchQuery}%`;
            conditions.push(
                sql`(${deals.title} LIKE ${pattern} OR ${deals.shortDescription} LIKE ${pattern} OR ${brands.name} LIKE ${pattern} OR ${categories.name} LIKE ${pattern})`
            );
        }
    }

    if (options.brandId) {
        conditions.push(eq(deals.brandId, options.brandId));
    }

    if (options.excludeDealId) {
        conditions.push(sql`${deals.id} != ${options.excludeDealId}`);
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

export async function findDealBySlug(slug: string, countryCode?: string) {
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

    const normalizedCountryCode = countryCode?.trim().toUpperCase();
    let selectedOverride: typeof dealGeoConfig.$inferSelect | null = null;
    let resolvedCountry = "default";

    if (normalizedCountryCode) {
        const overrides = await db
            .select()
            .from(dealGeoConfig)
            .where(
                and(
                    eq(dealGeoConfig.dealId, result[0].deal.id),
                    inArray(dealGeoConfig.countryCode, [normalizedCountryCode, "GLOBAL"])
                )
            );

        const countryOverride = overrides.find((item) => item.countryCode === normalizedCountryCode);
        const globalOverride = overrides.find((item) => item.countryCode === "GLOBAL");
        selectedOverride = countryOverride ?? globalOverride ?? null;
        if (countryOverride) {
            resolvedCountry = normalizedCountryCode;
        } else if (globalOverride) {
            resolvedCountry = "GLOBAL";
        }
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

    const resolvedDeal = {
        ...result[0].deal,
        claimUrl: selectedOverride?.claimUrl ?? result[0].deal.claimUrl,
        affiliateUrl: selectedOverride?.affiliateUrl ?? result[0].deal.affiliateUrl,
        studentPrice: selectedOverride?.studentPrice ?? result[0].deal.studentPrice,
        originalPrice: selectedOverride?.originalPrice ?? result[0].deal.originalPrice,
        currency: selectedOverride?.currency ?? result[0].deal.currency,
        discountLabel: selectedOverride?.discountLabel ?? result[0].deal.discountLabel,
        isAvailable: selectedOverride?.isAvailable ?? true,
        resolvedCountry,
    };

    return {
        ...result[0],
        deal: resolvedDeal,
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

export interface DealRedirectResolution {
    deal: typeof deals.$inferSelect;
    destinationUrl: string | null;
    isAvailable: boolean;
}

export async function resolveDealRedirectBySlug(slug: string, countryCode: string): Promise<DealRedirectResolution> {
    const result = await db
        .select({ deal: deals })
        .from(deals)
        .where(and(eq(deals.slug, slug), eq(deals.isActive, true)))
        .limit(1);

    if (!result[0]) {
        throw new NotFoundError("Deal not found");
    }

    const deal = result[0].deal;
    const normalizedCountryCode = countryCode.trim().toUpperCase();

    const overrides = await db
        .select()
        .from(dealGeoConfig)
        .where(
            and(
                eq(dealGeoConfig.dealId, deal.id),
                inArray(dealGeoConfig.countryCode, [normalizedCountryCode, "GLOBAL"])
            )
        );

    const countryOverride = overrides.find((item) => item.countryCode === normalizedCountryCode);
    const globalOverride = overrides.find((item) => item.countryCode === "GLOBAL");
    const selectedOverride = countryOverride ?? globalOverride ?? null;

    const destinationUrl =
        selectedOverride?.affiliateUrl ??
        selectedOverride?.claimUrl ??
        deal.affiliateUrl ??
        deal.claimUrl;

    const isAvailable = selectedOverride?.isAvailable ?? true;

    return {
        deal,
        destinationUrl: destinationUrl ?? null,
        isAvailable,
    };
}

export interface InsertDealClickEventInput {
    dealId: string;
    brandId?: string | null;
    source?: string | null;
    referrer?: string | null;
    userAgent?: string | null;
    device?: string | null;
    country?: string | null;
    regionCode?: string | null;
    city?: string | null;
}

export async function insertDealClickEvent(input: InsertDealClickEventInput) {
    await db.insert(clicks).values({
        dealId: input.dealId,
        brandId: input.brandId ?? null,
        source: input.source ?? null,
        referrer: input.referrer ?? null,
        userAgent: input.userAgent ?? null,
        device: input.device ?? null,
        country: input.country ?? null,
        regionCode: input.regionCode ?? null,
        city: input.city ?? null,
    });
}
