import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db, categories, deals, brands, eq } from "@uni-perks/db";

const app = new OpenAPIHono();

const SEED_CATEGORIES = [
    { name: 'Cloud Infrastructure', slug: 'cloud', icon: 'server' },
    { name: 'AI & Machine Learning', slug: 'ai', icon: 'brain' },
    { name: 'Database Services', slug: 'db', icon: 'database' },
    { name: 'Analytics & Monitoring', slug: 'analytics', icon: 'chart' },
    { name: 'Developer Tools', slug: 'dev', icon: 'code' },
    { name: 'Communication', slug: 'comm', icon: 'message' },
    { name: 'Design & Collab', slug: 'design', icon: 'pen' },
    { name: 'Other Services', slug: 'other', icon: 'box' },
];

const SEED_PERKS = [
    {
        title: 'Google for Startups Cloud Program',
        company: 'Google Cloud',
        shortDescription: 'Cloud credits over two years with additional perks for AI-focused startups. Includes access to Firebase, technical support, and Google Workspace discounts.',
        longDescription: 'The Google for Startups Cloud Program covers your cloud costs for up to two years. Startups can receive up to $350k in Google Cloud credits. AI startups may be eligible for even more.',
        valueAmount: 350000,
        valueCurrency: 'USD',
        companyLogo: '',
        claimUrl: 'https://cloud.google.com/startup',
        isFeatured: true,
        categorySlug: 'cloud'
    },
    {
        title: 'Cloudflare for Startups',
        company: 'Cloudflare',
        shortDescription: "Credits for Cloudflare's Developer Platform including Workers, Pages, R2 storage, D1 database, and enterprise-level security.",
        longDescription: 'Cloudflare for Startups provides up to $250k in credits to help you build and scale your application. Includes access to the full developer platform.',
        valueAmount: 250000,
        valueCurrency: 'USD',
        claimUrl: 'https://www.cloudflare.com/startups/',
        isFeatured: true,
        categorySlug: 'cloud'
    },
    {
        title: 'Founders Hub Credits',
        company: 'Microsoft',
        shortDescription: 'Azure credits plus free GitHub Enterprise (20 seats), Microsoft 365, Visual Studio, and OpenAI credits. Includes technical support and mentoring.',
        longDescription: 'Microsoft for Startups Founders Hub helps startups at every stage with up to $150k in Azure credits, OpenAI API access, and essential productivity tools.',
        valueAmount: 150000,
        valueCurrency: 'USD',
        claimUrl: 'https://foundershub.startups.microsoft.com/',
        isFeatured: true,
        categorySlug: 'cloud'
    },
    {
        title: 'AWS Activate Program',
        company: 'Amazon AWS',
        shortDescription: 'AWS credits covering EC2, S3, Lambda, RDS, DynamoDB, and most AWS services. Includes technical support, training, and business support.',
        longDescription: 'AWS Activate provides startups with the resources they need to get started on AWS. Eligible startups can receive up to $100k in AWS credits.',
        valueAmount: 100000,
        valueCurrency: 'USD',
        claimUrl: 'https://aws.amazon.com/activate/',
        isFeatured: true,
        categorySlug: 'cloud'
    },
    {
        title: 'Anthropic Startup Program',
        company: 'Anthropic',
        shortDescription: 'Do etc. AI credits with priority rate limits and access to Anthropic technical team.',
        valueAmount: 25000,
        valueCurrency: 'USD',
        isFeatured: true,
        categorySlug: 'ai'
    },
    {
        title: 'ElevenLabs Grants Program',
        company: 'ElevenLabs',
        shortDescription: '33 million characters (~$4,000+) of high-quality text-to-speech.',
        valueAmount: 4000,
        valueCurrency: 'USD',
        isFeatured: true,
        categorySlug: 'ai'
    },
    {
        title: 'Mixpanel for Startups',
        company: 'Mixpanel',
        shortDescription: 'One year free of Mixpanel Growth plan including product analytics.',
        valueAmount: 50000,
        valueCurrency: 'USD',
        isFeatured: true,
        categorySlug: 'analytics'
    },
    {
        title: 'PostHog for Startups',
        company: 'PostHog',
        shortDescription: 'All-in-one platform with product analytics, session replay, feature flags.',
        valueAmount: 50000,
        valueCurrency: 'USD',
        isFeatured: true,
        categorySlug: 'analytics'
    },
    {
        title: 'Datadog for Startups',
        company: 'Datadog',
        shortDescription: 'Comprehensive monitoring platform including APM, infrastructure monitoring, log management.',
        valueAmount: 0,
        isFeatured: true,
        categorySlug: 'analytics'
    },
    {
        title: 'Retool Startup Program',
        company: 'Retool',
        shortDescription: 'Build internal tools fast. $25k in credits.',
        valueAmount: 25000,
        valueCurrency: 'USD',
        isFeatured: true,
        categorySlug: 'dev'
    },
    {
        title: 'GitHub for Startups',
        company: 'GitHub',
        shortDescription: '20 seats free GitHub Enterprise.',
        valueAmount: 0,
        isFeatured: true,
        categorySlug: 'dev'
    },
    {
        title: 'Stripe Atlas',
        company: 'Stripe',
        shortDescription: '$150 off incorporation + perks.',
        valueAmount: 150,
        valueCurrency: 'USD',
        isFeatured: true,
        categorySlug: 'other'
    }
];

function slugify(text: string) {
    return text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

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

        // 1. Categories
        const insertedCategories: Record<string, string> = {}; // slug -> id

        for (const cat of SEED_CATEGORIES) {
            const existing = await db.select().from(categories).where(eq(categories.slug, cat.slug)).limit(1);
            if (existing.length > 0 && existing[0]) {
                insertedCategories[cat.slug] = existing[0].id;
            } else {
                const res = await db.insert(categories).values({
                    name: cat.name,
                    slug: cat.slug,
                    icon: cat.icon
                }).returning();
                if (res[0]) {
                    insertedCategories[cat.slug] = res[0].id;
                }
            }
        }

        // 2. Deals (formerly perks)
        let insertedCount = 0;
        for (const perk of SEED_PERKS) {
            const slug = slugify(perk.title);
            const existing = await db.select().from(deals).where(eq(deals.slug, slug)).limit(1);

            // Check category first
            const catId = insertedCategories[perk.categorySlug];
            if (!catId) {
                console.warn(`Category not found for perk ${perk.title}: ${perk.categorySlug}`);
                continue;
            }

            if (existing.length > 0 && existing[0]) {
                // Skip if exists
            } else {
                // Ensure default brand exists
                let brandId;
                const brandSlug = "partner-brand";
                const existingBrand = await db.select().from(brands).where(eq(brands.slug, brandSlug)).limit(1);

                if (existingBrand.length > 0 && existingBrand[0]) {
                    brandId = existingBrand[0].id;
                } else {
                    const newBrand = await db.insert(brands).values({
                        name: "Partner Brand",
                        slug: brandSlug,
                        description: "Default partner for seeded deals",
                        website: "https://example.com",
                        isVerified: true
                    }).returning();
                    if (newBrand[0]) brandId = newBrand[0].id;
                }

                if (brandId) {
                    await db.insert(deals).values({
                        title: perk.title,
                        slug: slug,
                        brandId: brandId,
                        categoryId: catId,
                        shortDescription: perk.shortDescription,
                        longDescription: perk.longDescription,
                        // Default values for required fields
                        discountType: "percentage",
                        discountLabel: "Special Offer",
                        verificationMethod: "email",
                        claimUrl: perk.claimUrl,
                        isFeatured: perk.isFeatured,
                        isActive: true
                    } as any);
                    insertedCount++;
                }
            }
        }

        console.log(`✅ Seeded ${insertedCount} deals.`);

        return c.json({ success: true, message: `Seeded categories and ${insertedCount} deals.` }, 200);
    } catch (e) {
        console.error(e);
        return c.json({ success: false, error: String(e) }, 500);
    }
});

export default app;
