import type { Perk } from "@uni-perks/db";

export interface PerkWithCategory {
    perk: Perk;
    category: any;
}

/**
 * Sort perks: local first, then by priority, then by view count
 */
export function sortPerksByRelevance(
    perks: PerkWithCategory[],
    userCountry: string
): PerkWithCategory[] {
    return perks.sort((a, b) => {
        const aIsLocal = a.perk.availableCountries?.includes(userCountry) && !a.perk.isGlobal;
        const bIsLocal = b.perk.availableCountries?.includes(userCountry) && !b.perk.isGlobal;

        // Local perks first
        if (aIsLocal && !bIsLocal) return -1;
        if (!aIsLocal && bIsLocal) return 1;

        // Then by display priority
        const aPriority = a.perk.displayPriority || 0;
        const bPriority = b.perk.displayPriority || 0;
        if (aPriority !== bPriority) {
            return bPriority - aPriority;
        }

        // Finally by view count
        return (b.perk.viewCount || 0) - (a.perk.viewCount || 0);
    });
}
