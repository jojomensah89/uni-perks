import type { ApiDealResponse } from "@/components/DealCard";
import type { CategoryInfo, RegionInfo, BrandInfo, TagInfo } from "./templates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://uni-perks.com';

export interface InternalLink {
    label: string;
    url: string;
    type: 'parent' | 'sibling' | 'cross-playbook';
}

/**
 * Generates internal links for CURATION pages
 * Links to: parent category, sibling categories, location pages, comparison pages
 */
export function generateCurationInternalLinks(params: {
    currentCategory: CategoryInfo;
    allCategories: CategoryInfo[];
    regions: RegionInfo[];
    deals: ApiDealResponse[];
}): InternalLink[] {
    const { currentCategory, allCategories, regions, deals } = params;
    const links: InternalLink[] = [];

    // Parent link - browse all deals
    links.push({
        label: 'All Student Discounts',
        url: '/browse',
        type: 'parent',
    });

    // Sibling links - other categories
    const siblingCategories = allCategories
        .filter(c => c.slug !== currentCategory.slug)
        .slice(0, 2);

    for (const cat of siblingCategories) {
        links.push({
            label: `${cat.name} Student Discounts`,
            url: `/student-discounts/${cat.slug}`,
            type: 'sibling',
        });
    }

    // Cross-playbook links - location pages for this category
    const topRegions = regions.slice(0, 2);
    for (const region of topRegions) {
        links.push({
            label: `${currentCategory.name} Deals in ${region.name}`,
            url: `/student-discounts/${currentCategory.slug}/in/${region.code.toLowerCase()}`,
            type: 'cross-playbook',
        });
    }

    // Cross-playbook links - comparison pages between brands in this category
    const brands = [...new Set(deals.map(d => d.brand))];
    if (brands.length >= 2) {
        const [brandA, brandB] = brands;
        links.push({
            label: `${brandA.name} vs ${brandB.name} Student Discount`,
            url: `/compare/${[brandA.slug, brandB.slug].sort().join('-vs-')}`,
            type: 'cross-playbook',
        });
    }

    return links;
}

/**
 * Generates internal links for LOCATION pages
 * Links to: parent location hub, sibling regions, category-specific location pages
 */
export function generateLocationInternalLinks(params: {
    currentRegion: RegionInfo;
    allRegions: RegionInfo[];
    categories: CategoryInfo[];
    deals: ApiDealResponse[];
    categorySlug?: string;
}): InternalLink[] {
    const { currentRegion, allRegions, categories, deals, categorySlug } = params;
    const links: InternalLink[] = [];

    if (categorySlug) {
        // Category + Location page
        const category = categories.find(c => c.slug === categorySlug);
        if (category) {
            links.push({
                label: `${category.name} Student Discounts`,
                url: `/student-discounts/${categorySlug}`,
                type: 'parent',
            });
            links.push({
                label: `All Deals in ${currentRegion.name}`,
                url: `/student-discounts/in/${currentRegion.code.toLowerCase()}`,
                type: 'parent',
            });
        }
    } else {
        // Pure location page
        links.push({
            label: 'All Student Discounts',
            url: '/browse',
            type: 'parent',
        });
    }

    // Sibling regions
    const siblingRegions = allRegions
        .filter(r => r.code !== currentRegion.code)
        .slice(0, 2);

    for (const region of siblingRegions) {
        links.push({
            label: `Student Discounts in ${region.name}`,
            url: `/student-discounts/in/${region.code.toLowerCase()}`,
            type: 'sibling',
        });
    }

    // Cross-playbook - category pages
    const topCategories = categories.slice(0, 2);
    for (const cat of topCategories) {
        links.push({
            label: `${cat.name} Student Discounts`,
            url: `/student-discounts/${cat.slug}`,
            type: 'cross-playbook',
        });
    }

    return links;
}

/**
 * Generates internal links for COMPARISON pages
 * Links to: both brand pages, sibling comparisons, category curation page
 */
export function generateComparisonInternalLinks(params: {
    brandA: BrandInfo;
    brandB: BrandInfo;
    category: CategoryInfo;
    otherBrands: BrandInfo[];
    existingComparisons: Array<{ brandA: string; brandB: string }>;
}): InternalLink[] {
    const { brandA, brandB, category, otherBrands, existingComparisons } = params;
    const links: InternalLink[] = [];

    // Parent - category curation
    links.push({
        label: `${category.name} Student Discounts`,
        url: `/student-discounts/${category.slug}`,
        type: 'parent',
    });

    // Brand pages
    links.push({
        label: `${brandA.name} Student Discounts`,
        url: `/brands/${brandA.slug}`,
        type: 'sibling',
    });
    links.push({
        label: `${brandB.name} Student Discounts`,
        url: `/brands/${brandB.slug}`,
        type: 'sibling',
    });

    // Sibling comparisons - other brands in same category
    const otherBrand = otherBrands.find(b => b.slug !== brandA.slug && b.slug !== brandB.slug);
    if (otherBrand) {
        const comparisonSlug = [brandA.slug, otherBrand.slug].sort().join('-vs-');
        links.push({
            label: `${brandA.name} vs ${otherBrand.name} Student Discount`,
            url: `/compare/${comparisonSlug}`,
            type: 'sibling',
        });
    }

    return links;
}

/**
 * Generates internal links for PERSONA pages
 * Links to: relevant category pages, brand pages, sibling personas
 */
export function generatePersonaInternalLinks(params: {
    currentPersona: { name: string; slug: string };
    otherPersonas: Array<{ name: string; slug: string }>;
    relevantCategories: CategoryInfo[];
    deals: ApiDealResponse[];
}): InternalLink[] {
    const { currentPersona, otherPersonas, relevantCategories, deals } = params;
    const links: InternalLink[] = [];

    // Parent
    links.push({
        label: 'All Student Discounts',
        url: '/browse',
        type: 'parent',
    });

    // Sibling personas
    const siblings = otherPersonas.slice(0, 2);
    for (const persona of siblings) {
        links.push({
            label: `${persona.name} Discounts`,
            url: `/for/${persona.slug}`,
            type: 'sibling',
        });
    }

    // Cross-playbook - relevant categories
    const topCategories = relevantCategories.slice(0, 2);
    for (const cat of topCategories) {
        links.push({
            label: `${cat.name} Student Discounts`,
            url: `/student-discounts/${cat.slug}`,
            type: 'cross-playbook',
        });
    }

    // Cross-playbook - top brand from deals
    const topBrand = deals[0]?.brand;
    if (topBrand) {
        links.push({
            label: `${topBrand.name} Student Discounts`,
            url: `/brands/${topBrand.slug}`,
            type: 'cross-playbook',
        });
    }

    return links;
}

/**
 * Generates related page suggestions for any pSEO page
 */
export function generateRelatedPages(params: {
    currentPlaybook: 'curation' | 'comparison' | 'location' | 'persona';
    currentSlug: string;
    categories: CategoryInfo[];
    regions: RegionInfo[];
    brands: BrandInfo[];
}): Array<{ label: string; url: string }> {
    const { currentPlaybook, currentSlug, categories, regions, brands } = params;
    const related: Array<{ label: string; url: string }> = [];

    // Always suggest browse
    related.push({
        label: 'Browse All Deals',
        url: '/browse',
    });

    // Suggest a random category
    if (categories.length > 0) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        related.push({
            label: `${randomCategory.name} Discounts`,
            url: `/student-discounts/${randomCategory.slug}`,
        });
    }

    // Suggest a random region
    if (regions.length > 0) {
        const randomRegion = regions[Math.floor(Math.random() * regions.length)];
        related.push({
            label: `Deals in ${randomRegion.name}`,
            url: `/student-discounts/in/${randomRegion.code.toLowerCase()}`,
        });
    }

    return related;
}
