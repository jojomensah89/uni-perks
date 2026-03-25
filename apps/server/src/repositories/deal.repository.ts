import { db, deals, brands, categories, clicks, eq, and, desc, inArray, sql } from "@uni-perks/db";
import { NotFoundError } from "../lib/errors";

export interface FindManyDealsOptions {
    categorySlug?: string;
    collectionId?: string;
    featured?: boolean;
    status?: "draft" | "published" | "archived";
    searchQuery?: string;
    limit?: number;
    offset?: number;
    brandId?: string;
    excludeDealId?: string;
    sortBy?: "popular" | "new" | "expiring";
}

export async function findManyDeals(options: FindManyDealsOptions) {
    const {
        categorySlug,
        collectionId,
        featured,
        status = "published",
        searchQuery,
        limit = 50,
        offset = 0,
        sortBy = "popular",
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

        conditions.push(eq(deals.status, status));

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

            if (rowIds.length === 0) {
                conditions.push(sql`1 = 0`);
            } else {
                conditions.push(sql`${deals.id} IN (SELECT id FROM deals WHERE rowid IN (${sql.join(rowIds, sql`, `)}))`);
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

    // Apply sorting based on sortBy option
    let orderedQuery;
    switch (sortBy) {
        case "new":
            orderedQuery = query.orderBy(desc(deals.createdAt));
            break;
        case "expiring":
            // Sort by expiration date (nulls last), then by click count
            orderedQuery = query.orderBy(sql`${deals.expirationDate} ASC NULLS LAST`, desc(deals.clickCount));
            break;
        case "popular":
        default:
            orderedQuery = query.orderBy(desc(deals.clickCount), desc(deals.viewCount));
            break;
    }

    const results = await orderedQuery
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

    return {
        ...result[0],
        deal: result[0].deal,
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
}

export async function resolveDealRedirectBySlug(slug: string, countryCode: string): Promise<DealRedirectResolution> {
    const result = await db
        .select({ deal: deals })
        .from(deals)
        .where(and(eq(deals.slug, slug), eq(deals.status, "published")))
        .limit(1);

    if (!result[0]) {
        throw new NotFoundError("Deal not found");
    }

    const deal = result[0].deal;
    const destinationUrl = deal.affiliateUrl ?? deal.claimUrl;

    return {
        deal,
        destinationUrl: destinationUrl ?? null,
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
    });
}
