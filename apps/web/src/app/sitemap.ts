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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        // Fetch all deals, brands, and categories from new API
        const [dealsData, brandsData, categoriesData] = await Promise.all([
            fetchAPI<{ deals: any[] }>('api/deals?limit=1000', { cache: 'force-cache' }),
            fetchAPI<{ brands: any[] }>('api/brands', { cache: 'force-cache' }),
            fetchAPI<{ categories: any[] }>('api/categories', { cache: 'force-cache' }),
        ]);

        const deals = dealsData.deals || [];
        const brands = brandsData.brands || [];
        const categories = categoriesData.categories || [];

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
            // Category pages
            ...categories.map((cat: any) => ({
                url: `${SITE_URL}/categories/${cat.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            })),
            // Auth pages
            {
                url: `${SITE_URL}/login`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.3,
            },
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

