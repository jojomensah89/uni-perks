import {
    findManyDeals,
    findDealBySlug,
    incrementDealViewCount,
    incrementDealClickCount,
} from "../repositories/deal.repository";

export interface GetDealsOptions {
    country?: string;
    categorySlug?: string;
    collectionId?: string;
    featured?: boolean;
    regionCode?: string;
    searchQuery?: string;
    limit?: number;
    offset?: number;
    brandId?: string;
    excludeDealId?: string;
}

export interface DealDetailOptions {
    slug: string;
    country?: string;
}

/**
 * Get filtered and sorted deals
 */
export async function getDeals(options: GetDealsOptions) {
    const results = await findManyDeals({
        categorySlug: options.categorySlug,
        collectionId: options.collectionId,
        featured: options.featured,
        isActive: true,
        regionCode: options.regionCode,
        searchQuery: options.searchQuery,
        limit: options.limit,
        offset: options.offset,
        brandId: options.brandId,
        excludeDealId: options.excludeDealId,
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
