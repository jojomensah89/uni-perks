import { db } from ".";
import { brands, categories, deals } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
    try {
        // Categories
        const categoryData = [
            { name: "Tech & Software", slug: "tech-software", icon: "laptop", color: "#3B82F6" },
            { name: "Streaming & Entertainment", slug: "streaming", icon: "play-circle", color: "#EF4444" },
            { name: "Food & Delivery", slug: "food-delivery", icon: "utensils", color: "#F59E0B" },
            { name: "Fashion & Lifestyle", slug: "fashion", icon: "shopping-bag", color: "#EC4899" },
            { name: "Travel & Transport", slug: "travel", icon: "plane", color: "#10B981" },
            { name: "Education & Learning", slug: "education", icon: "graduation-cap", color: "#8B5CF6" },
        ];

        for (const category of categoryData) {
            const existing = await db.select().from(categories).where(eq(categories.slug, category.slug)).limit(1);
            if (!existing[0]) {
                await db.insert(categories).values(category);
            }
        }

        // Brands
        const brandData = [
            {
                slug: "github",
                name: "GitHub",
                tagline: "Where the world builds software",
                whyWeLoveIt:
                    "GitHub's Student Developer pack is unmatched. It’s an essential toolkit that gives every CS student a massive head start.",
                website: "https://github.com",
                isVerified: true,
            },
            {
                slug: "spotify",
                name: "Spotify",
                tagline: "Music for everyone",
                whyWeLoveIt: "Bundled Hulu and endless playlists make this a no-brainer study companion.",
                website: "https://spotify.com",
                isVerified: true,
            },
        ];

        const brandIdBySlug: Record<string, string> = {};
        for (const brand of brandData) {
            const existing = await db.select().from(brands).where(eq(brands.slug, brand.slug)).limit(1);
            if (existing[0]) {
                brandIdBySlug[brand.slug] = existing[0].id;
            } else {
                const inserted = await db.insert(brands).values(brand).returning();
                if (inserted[0]) {
                    brandIdBySlug[brand.slug] = inserted[0].id;
                }
            }
        }

        // Deals
        const dealsData = [
            {
                slug: "github-student-pack",
                title: "GitHub Student Developer Pack",
                shortDescription: "Free access to GitHub Pro + top dev tools.",
                discountType: "other",
                discountLabel: "Free for students",
                claimUrl: "https://education.github.com/pack",
                brandSlug: "github",
                categorySlug: "tech-software",
                verificationMethod: "edu_email",
                status: "published",
                conditions: JSON.stringify(["Must verify student status", "Limited to one account"]),
            },
            {
                slug: "spotify-student-premium",
                title: "Spotify Premium Student + Hulu",
                shortDescription: "Premium music plus Hulu for students.",
                discountType: "percent",
                discountValue: 50,
                discountLabel: "50% OFF",
                claimUrl: "https://www.spotify.com/student/",
                brandSlug: "spotify",
                categorySlug: "streaming",
                verificationMethod: "edu_email",
                status: "published",
            },
        ];

        for (const deal of dealsData) {
            const brandId = brandIdBySlug[deal.brandSlug];
            const category = await db.select().from(categories).where(eq(categories.slug, deal.categorySlug)).limit(1);
            if (!brandId || !category[0]) continue;

            const existing = await db.select().from(deals).where(eq(deals.slug, deal.slug)).limit(1);
            const payload = {
                ...deal,
                brandId,
                categoryId: category[0].id,
            } as any;
            delete payload.brandSlug;
            delete payload.categorySlug;

            if (existing[0]) {
                await db.update(deals).set(payload).where(eq(deals.id, existing[0].id));
            } else {
                await db.insert(deals).values(payload);
            }
        }

        console.log("✅ Seed complete");
    } catch (error) {
        console.error("❌ Seed failed", error);
        throw error;
    }
}

if (import.meta.main) {
    seed();
}
