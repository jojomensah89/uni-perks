import type { ApiDealResponse } from "@/components/DealCard";

const MIN_DEALS_FOR_PAGE = 2;
const MIN_WORDS_INFORMATIONAL = 900;
const MIN_WORDS_UTILITY = 600;
const MIN_FAQS = 3;
const MIN_INTERNAL_LINKS = 5;

export interface ValidationResult {
    isValid: boolean;
    reason?: string;
}

/**
 * Validates if a page should be generated based on data requirements
 */
export function validatePageGeneration(params: {
    deals: ApiDealResponse[];
    playbookType: 'curation' | 'comparison' | 'location' | 'persona';
    slug: string;
    existingSlugs?: Set<string>;
}): ValidationResult {
    const { deals, playbookType, slug, existingSlugs = new Set() } = params;

    // Check minimum deals threshold
    if (deals.length < MIN_DEALS_FOR_PAGE) {
        return {
            isValid: false,
            reason: `Only ${deals.length} deals found, minimum ${MIN_DEALS_FOR_PAGE} required`,
        };
    }

    // Check slug uniqueness
    if (existingSlugs.has(slug)) {
        return {
            isValid: false,
            reason: `Duplicate slug: ${slug}`,
        };
    }

    return { isValid: true };
}

/**
 * Validates a comparison page has minimum data for both brands
 */
export function validateComparisonPage(params: {
    brandADeals: ApiDealResponse[];
    brandBDeals: ApiDealResponse[];
    brandASlug: string;
    brandBSlug: string;
    sameCategory: boolean;
}): ValidationResult {
    const { brandADeals, brandBDeals, brandASlug, brandBSlug, sameCategory } = params;

    if (!sameCategory) {
        return {
            isValid: false,
            reason: `Brands ${brandASlug} and ${brandBSlug} are not in the same category`,
        };
    }

    if (brandADeals.length < 1) {
        return {
            isValid: false,
            reason: `Brand ${brandASlug} has no active deals`,
        };
    }

    if (brandBDeals.length < 1) {
        return {
            isValid: false,
            reason: `Brand ${brandBSlug} has no active deals`,
        };
    }

    return { isValid: true };
}

/**
 * Ensures alphabetical slug ordering for comparison pages to prevent duplicates
 * e.g., "apple-vs-spotify" not "spotify-vs-apple"
 */
export function normalizeComparisonSlug(brandASlug: string, brandBSlug: string): string {
    const sorted = [brandASlug, brandBSlug].sort((a, b) => a.localeCompare(b));
    return `${sorted[0]}-vs-${sorted[1]}`;
}

/**
 * Validates content quality thresholds
 */
export function validateContentQuality(params: {
    wordCount: number;
    faqCount: number;
    internalLinkCount: number;
    isInformational: boolean;
}): ValidationResult {
    const { wordCount, faqCount, internalLinkCount, isInformational } = params;
    const minWords = isInformational ? MIN_WORDS_INFORMATIONAL : MIN_WORDS_UTILITY;

    if (wordCount < minWords) {
        return {
            isValid: false,
            reason: `Content has ${wordCount} words, minimum ${minWords} required`,
        };
    }

    if (faqCount < MIN_FAQS) {
        return {
            isValid: false,
            reason: `Only ${faqCount} FAQs, minimum ${MIN_FAQS} required`,
        };
    }

    if (internalLinkCount < MIN_INTERNAL_LINKS) {
        return {
            isValid: false,
            reason: `Only ${internalLinkCount} internal links, minimum ${MIN_INTERNAL_LINKS} required`,
        };
    }

    return { isValid: true };
}

/**
 * Detects potential keyword cannibalization between pages
 */
export function detectKeywordCannibalization(params: {
    primaryKeyword: string;
    existingKeywords: string[];
    threshold?: number;
}): boolean {
    const { primaryKeyword, existingKeywords, threshold = 0.8 } = params;
    const normalizedPrimary = primaryKeyword.toLowerCase().trim();

    for (const existing of existingKeywords) {
        const normalizedExisting = existing.toLowerCase().trim();
        const similarity = calculateSimilarity(normalizedPrimary, normalizedExisting);
        if (similarity >= threshold) {
            return true;
        }
    }

    return false;
}

/**
 * Simple similarity calculation using Levenshtein distance ratio
 */
function calculateSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    const distance = matrix[b.length][a.length];
    const maxLength = Math.max(a.length, b.length);
    return (maxLength - distance) / maxLength;
}
