import type { MetadataRoute } from 'next';
import { fetchAPI } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://uni-perks.com';

// Helper to safely parse date
function parseDate(dateValue: number | string | null | undefined): Date {
    if (!dateValue) return new Date();
    try {
        // Handle both ISO strings and timestamps (milliseconds)
        const date = typeof dateValue === 'number' ? new Date(dateValue) : new Date(dateValue);
        return isNaN(date.getTime()) ? new Date() : date;
    } catch {
        return new Date();
    }
}

// Personas for pSEO
const PSEO_PERSONAS = ['cs-students', 'design-students', 'all-students'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        // Fetch all deals, brands, categories, and regions from API
        const [dealsData, brandsData, categoriesData, regionsData] = await Promise.all([
            fetchAPI<{ deals: any[] }>('api/deals?limit=1000', { cache: 'force-cache' }),
            fetchAPI<{ brands: any[] }>('api/brands', { cache: 'force-cache' }),
            fetchAPI<{ categories: any[] }>('api/categories', { cache: 'force-cache' }),
            fetchAPI<{ regions: Array<{ code: string; name: string }> }>('api/geo/regions', { cache: 'force-cache' }),
        ]);

        const deals = dealsData.deals || [];
        const brands = brandsData.brands || [];
        const categories = categoriesData.categories || [];
        const regions = regionsData.regions || [];

        // Generate comparison URLs (brand pairs in same category)
        const rawComparisonUrls: MetadataRoute.Sitemap = [];
        const brandsByCategory = new Map<string, any[]>();

        for (const deal of deals) {
            const catSlug = deal.category?.slug;
            const brandSlug = deal.brand?.slug;
            if (catSlug && brandSlug) {
                if (!brandsByCategory.has(catSlug)) {
                    brandsByCategory.set(catSlug, []);
                }
                const catBrands = brandsByCategory.get(catSlug)!;
                if (!catBrands.find(b => b.slug === brandSlug)) {
                    catBrands.push({ slug: brandSlug, name: deal.brand?.name });
                }
            }
        }

        // Generate comparison URLs for brands in same category
        for (const [_catSlug, catBrands] of brandsByCategory) {
            for (let i = 0; i < catBrands.length; i++) {
                for (let j = i + 1; j < catBrands.length; j++) {
                    const [a, b] = [catBrands[i].slug, catBrands[j].slug].sort();
                    rawComparisonUrls.push({
                        url: `${SITE_URL}/compare/${a}-vs-${b}`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.7,
                    });
                }
            }
        }

        const MAX_COMPARISONS = 500;
        const comparisonUrls = rawComparisonUrls.slice(0, MAX_COMPARISONS);

        return [
            // Homepage
            {
                url: SITE_URL,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
            // Deals listing
            {
                url: `${SITE_URL}/deals`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
            // Browse page
            {
                url: `${SITE_URL}/browse`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },

            // ===== PSEO: CURATION PAGES =====
            // Category curation pages
            ...categories.map((cat: any) => ({
                url: `${SITE_URL}/student-discounts/${cat.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            })),

            // ===== PSEO: LOCATION PAGES =====
            // Region pages
            ...regions.map((region) => ({
                url: `${SITE_URL}/student-discounts/in/${region.code.toLowerCase()}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            })),
            // Category + Region combo pages
            ...categories.flatMap((cat: any) =>
                regions.map((region) => ({
                    url: `${SITE_URL}/student-discounts/${cat.slug}/in/${region.code.toLowerCase()}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.6,
                }))
            ),

            // ===== PSEO: COMPARISON PAGES =====
            ...comparisonUrls,

            // ===== PSEO: PERSONA PAGES =====
            ...PSEO_PERSONAS.map((personaSlug) => ({
                url: `${SITE_URL}/for/${personaSlug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            })),

            // ===== ORIGINAL PAGES =====
            // Deal detail pages
            ...deals.map((deal: any) => ({
                url: `${SITE_URL}/deals/${deal.deal?.slug || deal.slug}`,
                lastModified: parseDate(deal.deal?.updatedAt || deal.updatedAt || deal.deal?.createdAt || deal.createdAt),
                changeFrequency: 'weekly' as const,
                priority: deal.deal?.isFeatured || deal.isFeatured ? 0.8 : 0.7,
            })),
            // Brand pages
            ...brands.map((brand: any) => ({
                url: `${SITE_URL}/brands/${brand.slug}`,
                lastModified: parseDate(brand.updatedAt || brand.createdAt),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            })),
            // Category pages (original, not pSEO)
            ...categories.map((cat: any) => ({
                url: `${SITE_URL}/categories/${cat.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            })),
        ];
    } catch (error) {
        console.error('Error generating sitemap:', error);
        // Return at least the homepage if API fails
        return [
            {
                url: SITE_URL,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
        ];
    }
}

