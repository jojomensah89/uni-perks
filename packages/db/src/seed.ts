import { db } from '.';
import { brands, categories, deals, tags, regions, dealRegions, dealTags } from './schema';
import { eq } from 'drizzle-orm';

const SEED_REGIONS = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'GLOBAL', name: 'Global' },
];

const SEED_CATEGORIES = [
    { name: 'Tech & Software', slug: 'tech-software', icon: 'laptop', color: '#3B82F6' },
    { name: 'Streaming & Entertainment', slug: 'streaming', icon: 'play-circle', color: '#EF4444' },
    { name: 'Food & Delivery', slug: 'food-delivery', icon: 'utensils', color: '#F59E0B' },
    { name: 'Fashion & Lifestyle', slug: 'fashion', icon: 'shopping-bag', color: '#EC4899' },
    { name: 'Travel & Transport', slug: 'travel', icon: 'plane', color: '#10B981' },
    { name: 'Education & Learning', slug: 'education', icon: 'graduation-cap', color: '#8B5CF6' },
];

const SEED_TAGS = [
    { slug: 'developer-tools', name: 'Developer Tools', audience: 'cs-students' },
    { slug: 'design-tools', name: 'Design Tools', audience: 'designers' },
    { slug: 'productivity', name: 'Productivity', audience: 'all' },
    { slug: 'streaming', name: 'Streaming', audience: 'all' },
    { slug: 'music', name: 'Music', audience: 'all' },
    { slug: 'cloud-storage', name: 'Cloud Storage', audience: 'all' },
];

const SEED_BRANDS = [
    {
        slug: 'github',
        name: 'GitHub',
        tagline: 'Where the world builds software',
        website: 'https://github.com',
        isVerified: true,
    },
    {
        slug: 'spotify',
        name: 'Spotify',
        tagline: 'Music for everyone',
        website: 'https://spotify.com',
        isVerified: true,
    },
    {
        slug: 'adobe',
        name: 'Adobe',
        tagline: 'Creativity for all',
        website: 'https://adobe.com',
        isVerified: true,
    },
    {
        slug: 'amazon',
        name: 'Amazon',
        tagline: 'Everything store',
        website: 'https://amazon.com',
        isVerified: true,
    },
    {
        slug: 'apple',
        name: 'Apple',
        tagline: 'Think different',
        website: 'https://apple.com',
        isVerified: true,
    },
];

async function seed() {
    console.log('🌱 Seeding database...');

    try {
        // 1. Regions
        console.log('Inserting regions...');
        const insertedRegions: Record<string, string> = {};
        for (const region of SEED_REGIONS) {
            const existing = await db.select().from(regions).where(eq(regions.code, region.code)).limit(1);
            if (existing.length > 0 && existing[0]) {
                insertedRegions[region.code] = existing[0].id;
            } else {
                const res = await db.insert(regions).values(region).returning();
                if (res[0]) {
                    insertedRegions[region.code] = res[0].id;
                }
            }
        }

        // 2. Categories
        console.log('Inserting categories...');
        const insertedCategories: Record<string, string> = {};
        for (const cat of SEED_CATEGORIES) {
            const existing = await db.select().from(categories).where(eq(categories.slug, cat.slug)).limit(1);
            if (existing.length > 0 && existing[0]) {
                insertedCategories[cat.slug] = existing[0].id;
            } else {
                const res = await db.insert(categories).values(cat).returning();
                if (res[0]) {
                    insertedCategories[cat.slug] = res[0].id;
                }
            }
        }

        // 3. Tags
        console.log('Inserting tags...');
        const insertedTags: Record<string, string> = {};
        for (const tag of SEED_TAGS) {
            const existing = await db.select().from(tags).where(eq(tags.slug, tag.slug)).limit(1);
            if (existing.length > 0 && existing[0]) {
                insertedTags[tag.slug] = existing[0].id;
            } else {
                const res = await db.insert(tags).values(tag).returning();
                if (res[0]) {
                    insertedTags[tag.slug] = res[0].id;
                }
            }
        }

        // 4. Brands
        console.log('Inserting brands...');
        const insertedBrands: Record<string, string> = {};
        for (const brand of SEED_BRANDS) {
            const existing = await db.select().from(brands).where(eq(brands.slug, brand.slug)).limit(1);
            if (existing.length > 0 && existing[0]) {
                insertedBrands[brand.slug] = existing[0].id;
            } else {
                const res = await db.insert(brands).values(brand).returning();
                if (res[0]) {
                    insertedBrands[brand.slug] = res[0].id;
                }
            }
        }

        // 5. Sample Deals
        console.log('Inserting sample deals...');
        const sampleDeals = [
            {
                slug: 'github-student-developer-pack',
                brandId: insertedBrands['github']!,
                categoryId: insertedCategories['tech-software']!,
                title: 'GitHub Student Developer Pack',
                shortDescription: 'Free access to top developer tools',
                longDescription: 'Get free access to GitHub Pro, Copilot, and dozens of developer tools worth over $200k.',
                discountType: 'free',
                discountLabel: 'Free',
                verificationMethod: 'edu_email',
                claimUrl: 'https://education.github.com/pack',
                isFeatured: true,
                isActive: true,
                regions: ['GLOBAL'],
                tags: ['developer-tools', 'productivity'],
            },
            {
                slug: 'spotify-premium-student',
                brandId: insertedBrands['spotify']!,
                categoryId: insertedCategories['streaming']!,
                title: 'Spotify Premium Student',
                shortDescription: '50% off Premium with Hulu',
                longDescription: 'Get Spotify Premium + Hulu for just $5.99/month. Includes ad-free music, offline listening, and unlimited skips.',
                discountType: 'percentage',
                discountValue: 50,
                discountLabel: '50% OFF',
                originalPrice: 10.99,
                studentPrice: 5.99,
                currency: 'USD',
                verificationMethod: 'sheerid',
                claimUrl: 'https://www.spotify.com/student',
                isFeatured: true,
                isActive: true,
                regions: ['US', 'CA', 'GB'],
                tags: ['streaming', 'music'],
            },
            {
                slug: 'adobe-creative-cloud-student',
                brandId: insertedBrands['adobe']!,
                categoryId: insertedCategories['tech-software']!,
                title: 'Adobe Creative Cloud Student',
                shortDescription: '60% off Creative Cloud All Apps',
                longDescription: 'Get 60% off the full Adobe Creative Cloud suite including Photoshop, Illustrator, Premiere Pro, and more.',
                discountType: 'percentage',
                discountValue: 60,
                discountLabel: '60% OFF',
                originalPrice: 54.99,
                studentPrice: 19.99,
                currency: 'USD',
                verificationMethod: 'sheerid',
                claimUrl: 'https://www.adobe.com/creativecloud/buy/students.html',
                isFeatured: true,
                isActive: true,
                regions: ['GLOBAL'],
                tags: ['design-tools', 'productivity'],
            },
            {
                slug: 'amazon-prime-student',
                brandId: insertedBrands['amazon']!,
                categoryId: insertedCategories['streaming']!,
                title: 'Amazon Prime Student',
                shortDescription: '6-month free trial, then 50% off',
                longDescription: 'Get 6 months of Prime Student for free, then pay just $7.49/month. Includes free 2-day shipping, Prime Video, and exclusive student deals.',
                discountType: 'trial',
                discountLabel: '6 Months Free',
                originalPrice: 14.99,
                studentPrice: 7.49,
                currency: 'USD',
                verificationMethod: 'edu_email',
                claimUrl: 'https://www.amazon.com/primeStudent',
                isFeatured: true,
                isActive: true,
                regions: ['US'],
                tags: ['streaming', 'productivity'],
            },
            {
                slug: 'apple-music-student',
                brandId: insertedBrands['apple']!,
                categoryId: insertedCategories['streaming']!,
                title: 'Apple Music Student',
                shortDescription: '50% off Apple Music with Apple TV+',
                longDescription: 'Get Apple Music and Apple TV+ for just $5.99/month. Includes access to 100 million songs and exclusive shows.',
                discountType: 'percentage',
                discountValue: 50,
                discountLabel: '50% OFF',
                originalPrice: 10.99,
                studentPrice: 5.99,
                currency: 'USD',
                verificationMethod: 'unidays',
                claimUrl: 'https://www.apple.com/apple-music/student/',
                isFeatured: true,
                isActive: true,
                regions: ['US', 'GB', 'CA', 'AU'],
                tags: ['streaming', 'music'],
            },
        ];

        for (const deal of sampleDeals) {
            const existing = await db.select().from(deals).where(eq(deals.slug, deal.slug)).limit(1);

            let dealId: string;
            if (existing.length > 0 && existing[0]) {
                dealId = existing[0].id;
            } else {
                const { regions: dealRegionCodes, tags: dealTagSlugs, ...dealData } = deal;
                const res = await db.insert(deals).values(dealData).returning();
                if (!res[0]) continue;
                dealId = res[0].id;

                // Link regions
                for (const regionCode of dealRegionCodes) {
                    const regionId = insertedRegions[regionCode];
                    if (regionId) {
                        try {
                            await db.insert(dealRegions).values({ dealId, regionId });
                        } catch (e) {
                            // Ignore duplicates
                        }
                    }
                }

                // Link tags
                for (const tagSlug of dealTagSlugs) {
                    const tagId = insertedTags[tagSlug];
                    if (tagId) {
                        try {
                            await db.insert(dealTags).values({ dealId, tagId });
                        } catch (e) {
                            // Ignore duplicates
                        }
                    }
                }
            }
        }

        console.log('✅ Seeding complete!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

// Run if main
if (import.meta.main) {
    seed();
}
