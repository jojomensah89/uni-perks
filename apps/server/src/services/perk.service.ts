import {
    findManyPerks,
    findPerkBySlug,
    incrementPerkViewCount,
    incrementPerkClickCount,
} from "../repositories/perk.repository";
import { isPerkAvailableInCountry } from "../utils/geo.utils";
import { sortPerksByRelevance } from "../utils/sorting.utils";

export interface GetPerksOptions {
    country: string;
    categorySlug?: string;
    featured?: boolean;
    globalOnly?: boolean;
    region?: string;
}

export interface PerkDetailOptions {
    slug: string;
    country: string;
}

/**
 * Get filtered and sorted perks
 */
export async function getPerks(options: GetPerksOptions) {
    const { country, categorySlug, featured, globalOnly } = options;

    // Fetch perks from repository
    const results = await findManyPerks({
        categorySlug,
        featured,
        isActive: true,
        region: options.region,
    });

    // Filter by country availability
    const filteredPerks = results.filter(({ perk }) => {
        if (options.region) return true; // Skip country check if specific region requested
        if (globalOnly) return perk.isGlobal;
        return isPerkAvailableInCountry(perk, country);
    });

    // Sort by relevance
    const sortedPerks = sortPerksByRelevance(filteredPerks, country);

    return sortedPerks;
}

/**
 * Get perk detail with country-specific data
 */
export async function getPerkDetail(options: PerkDetailOptions) {
    const { slug, country } = options;

    // Repository throws NotFoundError if perk doesn't exist
    const result = await findPerkBySlug(slug);

    const available = isPerkAvailableInCountry(result.perk, country);

    // Get country-specific URL if available
    let claimUrl = result.perk.claimUrl;
    if (result.perk.countryUrls?.[country]) {
        claimUrl = result.perk.countryUrls[country];
    }

    // Get country-specific value if available
    let valueAmount = result.perk.valueAmount;
    if (result.perk.countryValues?.[country]) {
        valueAmount = result.perk.countryValues[country];
    }

    return {
        ...result,
        perk: {
            ...result.perk,
            claimUrl,
            valueAmount,
        },
        meta: {
            country,
            available,
        },
    };
}

/**
 * Track perk view
 */
export async function trackPerkView(perkId: string) {
    return await incrementPerkViewCount(perkId);
}

/**
 * Track perk click
 */
export async function trackPerkClick(perkId: string) {
    return await incrementPerkClickCount(perkId);
}
