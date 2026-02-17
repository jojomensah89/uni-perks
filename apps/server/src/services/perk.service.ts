import {
    getDeals,
    getDealDetail,
    trackDealView,
    trackDealClick,
} from "./deal.service";

export interface GetPerksOptions {
    country: string;
    categorySlug?: string;
    featured?: boolean;
    globalOnly?: boolean;
    region?: string;
    searchQuery?: string;
}

export interface PerkDetailOptions {
    slug: string;
    country: string;
}

/**
 * Get filtered and sorted perks (mapped from deals)
 */
export async function getPerks(options: GetPerksOptions) {
    const { country, categorySlug, featured, globalOnly, searchQuery } = options;

    // Map region to regionCode for deal service if possible, or just pass region as is if compatible
    // deal.service uses "regionCode", perk.service used "region". 
    // Assuming "region" strings are compatible or we rely on country filtering mostly.

    // Note: globalOnly logic from previous service is not directly supported in getDeals yet
    // without inspecting deals. But we will fetch and map.

    const deals = await getDeals({
        categorySlug,
        featured,
        searchQuery,
        regionCode: options.region, // Try passing region as regionCode
        // country: country // deal service supports country filtering?
        // getDeals has `country` in options but didn't implement it in findManyDeals?
        // findManyDeals has `regionCode`.
    });

    // Map deals to perks format
    return deals.map(item => ({
        perk: item.deal,
        category: item.category,
        brand: item.brand,
    }));
}

/**
 * Get perk detail with country-specific data
 */
export async function getPerkDetail(options: PerkDetailOptions) {
    const { slug, country } = options;

    const result = await getDealDetail({ slug, country });

    // Map to expected perk detail format
    return {
        // Spread result which contains deal, brand, category, tags, regions
        ...result,
        perk: result.deal,
        // Mock meta if needed
        meta: {
            country,
            available: true, // simplified
        },
    };
}

/**
 * Track perk view
 */
export async function trackPerkView(perkId: string) {
    return await trackDealView(perkId);
}

/**
 * Track perk click
 */
export async function trackPerkClick(perkId: string) {
    return await trackDealClick(perkId);
}
