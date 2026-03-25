import {
    findManyDeals,
    findDealBySlug,
    incrementDealViewCount,
    incrementDealClickCount,
    resolveDealRedirectBySlug,
    insertDealClickEvent,
    type InsertDealClickEventInput,
} from "../repositories/deal.repository";

export interface GetDealsOptions {
    categorySlug?: string;
    collectionId?: string;
    featured?: boolean;
    searchQuery?: string;
    limit?: number;
    offset?: number;
    brandId?: string;
    excludeDealId?: string;
    sortBy?: "popular" | "new" | "expiring";
}

export interface DealDetailOptions {
    slug: string;
}

/**
 * Get filtered and sorted deals
 */
export async function getDeals(options: GetDealsOptions) {
    const results = await findManyDeals({
        categorySlug: options.categorySlug,
        collectionId: options.collectionId,
        featured: options.featured,
        status: "published",
        searchQuery: options.searchQuery,
        limit: options.limit,
        offset: options.offset,
        brandId: options.brandId,
        excludeDealId: options.excludeDealId,
        sortBy: options.sortBy,
    });

    return results;
}

/**
 * Get deal detail with tags and regions
 */
export async function getDealDetail(options: DealDetailOptions) {
    const { slug } = options;
    const result = await findDealBySlug(slug);
    return result;
}

/**
 * Track deal view
 */
export async function trackDealView(dealId: string) {
    return await incrementDealViewCount(dealId);
}

/**
 * Track deal click
 */
export async function trackDealClick(dealId: string) {
    return await incrementDealClickCount(dealId);
}

export async function resolveDealRedirect(slug: string, country: string) {
    return await resolveDealRedirectBySlug(slug, country);
}

export async function trackDealClickEvent(input: InsertDealClickEventInput) {
    return await insertDealClickEvent(input);
}
