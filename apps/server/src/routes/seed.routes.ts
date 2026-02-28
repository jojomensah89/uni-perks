import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db, categories, deals, brands, tags, regions, dealRegions, dealTags, eq, and } from "@uni-perks/db";

const app = new OpenAPIHono();

// Student-focused seed data
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
        whyWeLoveIt: "GitHub's Student Developer pack is unmatched. It's an essential toolkit that gives every CS student a massive head start on their career for free.",
        website: 'https://github.com',
        isVerified: true,
    },
    {
        slug: 'spotify',
        name: 'Spotify',
        tagline: 'Music for everyone',
        whyWeLoveIt: "The undisputed king of study playlists. The fact that it bundles Hulu means you basically get endless music and binge-worthy TV for the price of a fancy coffee.",
        website: 'https://spotify.com',
        isVerified: true,
    },
    {
        slug: 'adobe',
        name: 'Adobe',
        tagline: 'Creativity for all',
        whyWeLoveIt: "Whether you're an art major or just need to edit a PDF for a club application, 60% off the entire Creative Cloud suite is one of the steepest and most useful discounts available.",
        website: 'https://adobe.com',
        isVerified: true,
    },
    {
        slug: 'amazon',
        name: 'Amazon',
        tagline: 'Everything store',
        whyWeLoveIt: "Free 2-day shipping is a lifesaver when you need textbooks or dorm room essentials in a pinch. The 6-month free trial is incredibly generous.",
        website: 'https://amazon.com',
        isVerified: true,
    },
    {
        slug: 'apple',
        name: 'Apple',
        tagline: 'Think different',
        whyWeLoveIt: "Apple rarely does sales, making their year-round education pricing highly sought after. Their Back to School gift card promo is the absolute best time for students to upgrade their laptops.",
        website: 'https://apple.com',
        isVerified: true,
    },
];

// Student-focused deals
const SEED_DEALS = [
    {
        slug: 'github-student-developer-pack',
        brandSlug: 'github',
        categorySlug: 'tech-software',
        title: 'GitHub Student Developer Pack',
        shortDescription: 'Free access to top developer tools',
        longDescription: 'Get free access to GitHub Pro, Copilot, and dozens of developer tools worth over $200k.',
        discountType: 'free',
        discountLabel: 'Free',
        verificationMethod: 'edu_email',
        claimUrl: 'https://education.github.com/pack',
        isNewCustomerOnly: false,
        conditions: [
            "Must be a student 13+ enrolled in a degree-granting institution.",
            "Free for the duration of your studies.",
            "Includes GitHub Copilot, Actions minutes, and Codespaces hours."
        ],
        howToRedeem: "Go to education.github.com and sign up with your school email. Upload a photo of your student ID if requested.",
        isFeatured: true,
        isActive: true,
        regions: ['GLOBAL'],
        tags: ['developer-tools', 'productivity'],
    },
    {
        slug: 'spotify-premium-student',
        brandSlug: 'spotify',
        categorySlug: 'streaming',
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
        isNewCustomerOnly: true,
        conditions: [
            "Requires a valid .edu email or university verification.",
            "Plan renews at student price as long as you remain eligible.",
            "Hulu and SHOWTIME bundle available in the US only.",
            "Limit of 1 Premium account per person."
        ],
        howToRedeem: "Sign up at spotify.com/student and verify your student status via SheerID to enjoy your discounted subscription.",
        isFeatured: true,
        isActive: true,
        regions: ['US', 'CA', 'GB'],
        tags: ['streaming', 'music'],
    },
    {
        slug: 'adobe-creative-cloud-student',
        brandSlug: 'adobe',
        categorySlug: 'tech-software',
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
        isNewCustomerOnly: false,
        conditions: [
            "Must be 13+ and enrolled in an accredited institution.",
            "First year at student price; standard pricing applies after.",
            "Annual plan with monthly payments. Early termination fee applies."
        ],
        howToRedeem: "Provide your school-issued email or upload enrollment proof at checkout.",
        isFeatured: true,
        isActive: true,
        regions: ['GLOBAL'],
        tags: ['design-tools', 'productivity'],
    },
    {
        slug: 'amazon-prime-student',
        brandSlug: 'amazon',
        categorySlug: 'streaming',
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
        isNewCustomerOnly: true,
        conditions: [
            "Valid .edu email required.",
            "6-month free trial, then $7.49/mo.",
            "Includes Prime Video, Music, Reading, and free shipping.",
            "Cancel anytime during or after trial."
        ],
        howToRedeem: "Go to amazon.com/joinstudent, sign in or create an Amazon account, and enter your .edu email to verify.",
        isFeatured: true,
        isActive: true,
        regions: ['US'],
        tags: ['streaming', 'productivity'],
    },
    {
        slug: 'apple-music-student',
        brandSlug: 'apple',
        categorySlug: 'streaming',
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
        isNewCustomerOnly: false,
        conditions: [
            "Student verification through UNiDAYS required.",
            "Includes Apple TV+ at no extra cost.",
            "Available for up to 4 years."
        ],
        howToRedeem: "Open Apple Music app or music.apple.com, select the Student plan, and verify through UNiDAYS.",
        isFeatured: true,
        isActive: true,
        regions: ['US', 'GB', 'CA', 'AU'],
        tags: ['streaming', 'music'],
    },
];

const seedRoute = createRoute({
    method: "post",
    path: "/",
    tags: ["Seed"],
    summary: "Seed Database",
    description: "Seed the database with initial categories and deals.",
    responses: {
        200: {
            description: "Seed successful",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                        message: z.string(),
                    }),
                },
            },
        },
        500: {
            description: "Seed failed",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                        error: z.string(),
                    }),
                },
            },
        }
    },
});

app.openapi(seedRoute, async (c) => {
    try {
        console.log('🌱 Seeding database via API...');

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

        // 5. Deals with region and tag mappings
        console.log('Inserting deals...');
        let insertedDeals = 0;
        for (const deal of SEED_DEALS) {
            const existing = await db.select().from(deals).where(eq(deals.slug, deal.slug)).limit(1);
            if (existing.length > 0 && existing[0]) {
                continue; // Skip if exists
            }

            const brandId = insertedBrands[deal.brandSlug];
            const categoryId = insertedCategories[deal.categorySlug];
            if (!brandId || !categoryId) {
                console.warn(`Missing brand or category for deal: ${deal.title}`);
                continue;
            }

            const { regions: dealRegionCodes, tags: dealTagSlugs, conditions, ...dealData } = deal;

            const insertData = {
                ...dealData,
                brandId,
                categoryId,
                conditions: conditions ? JSON.stringify(conditions) : null,
            };

            const res = await db.insert(deals).values(insertData).returning();
            if (!res[0]) continue;
            const dealId = res[0].id;
            insertedDeals++;

            // Link regions
            for (const regionCode of dealRegionCodes) {
                const regionId = insertedRegions[regionCode];
                if (regionId) {
                    try {
                        await db.insert(dealRegions).values({ dealId, regionId });
                    } catch {
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
                    } catch {
                        // Ignore duplicates
                    }
                }
            }
        }

        console.log(`✅ Seeded ${insertedDeals} deals.`);

        // 6. Seed a Featured Collection
        const { collections, collectionDeals } = await import("@uni-perks/db");
        const collectionSlug = "student-essentials";
        const existingCollection = await db.select().from(collections).where(eq(collections.slug, collectionSlug)).limit(1);

        let collectionId = existingCollection[0]?.id;

        if (!collectionId) {
            const newCollection = await db.insert(collections).values({
                name: "Student Essentials",
                slug: collectionSlug,
                description: "Must-have tools and resources for every student.",
                audience: "All Students",
                isFeatured: true,
                displayOrder: 1
            }).returning();
            if (newCollection[0]) collectionId = newCollection[0].id;
        }

        if (collectionId) {
            const allSeededDeals = await db.select().from(deals).limit(3);
            for (let i = 0; i < allSeededDeals.length; i++) {
                const deal = allSeededDeals[i];
                if (!deal) continue;

                const existingMap = await db.select().from(collectionDeals)
                    .where(and(eq(collectionDeals.collectionId, collectionId), eq(collectionDeals.dealId, deal.id)))
                    .limit(1);

                if (existingMap.length === 0) {
                    await db.insert(collectionDeals).values({
                        collectionId,
                        dealId: deal.id,
                        displayOrder: i
                    });
                }
            }
            console.log(`✅ Seeded Collection: Student Essentials`);
        }

        return c.json({ success: true, message: `Seeded ${Object.keys(insertedRegions).length} regions, ${Object.keys(insertedCategories).length} categories, ${Object.keys(insertedTags).length} tags, ${Object.keys(insertedBrands).length} brands, ${insertedDeals} deals, and 1 collection.` }, 200);
    } catch (e) {
        console.error(e);
        return c.json({ success: false, error: String(e) }, 500);
    }
});

export default app;
