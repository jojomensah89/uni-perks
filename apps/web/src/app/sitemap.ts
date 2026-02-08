import type { MetadataRoute } from 'next';
import { fetchAPI } from '@/lib/api';
import type { Perk } from '@/types';

interface PerksResponse {
    perks: { perk: Perk }[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://uni-perks.com';

    // Fetch all perks for dynamic routes
    let perks: Perk[] = [];
    try {
        const data = await fetchAPI<PerksResponse>('api/perks', { cache: 'force-cache' });
        perks = data.perks.map(p => p.perk);
    } catch (error) {
        console.error('Failed to fetch perks for sitemap:', error);
    }

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/perks`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // Dynamic perk routes
    const perkRoutes: MetadataRoute.Sitemap = perks.map((perk) => ({
        url: `${baseUrl}/perks/${perk.slug}`,
        lastModified: new Date(perk.createdAt),
        changeFrequency: 'weekly' as const,
        priority: perk.isFeatured ? 0.8 : 0.7,
    }));

    return [...staticRoutes, ...perkRoutes];
}
