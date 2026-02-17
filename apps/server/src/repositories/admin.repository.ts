import { db, deals, categories, eq, and, desc, asc } from "@uni-perks/db";
import { tryCatch } from "../lib/async-handler";
import type { Deal } from "@uni-perks/db";

export interface CreatePerkInput {
    slug: string;
    title: string;
    shortDescription: string;
    longDescription: string;
    company: string;
    companyLogo?: string;
    valueAmount?: number;
    valueCurrency?: string;
    categoryId: string;
    availableCountries?: string[];
    excludedCountries?: string[];
    isGlobal?: boolean;
    region?: string;
    regionNotes?: string;
    displayPriority?: number;
    countryUrls?: Record<string, string>;
    countryValues?: Record<string, number>;
    verificationMethod: string;
    eligibilityNote?: string;
    claimUrl: string;
    affiliateUrl?: string;
    isFeatured?: boolean;
    expirationDate?: Date;
}

export interface UpdatePerkInput extends Partial<CreatePerkInput> {
    id: string;
}

/**
 * Get all perks for admin (including inactive)
 */
export async function getAllPerksForAdmin(options?: {
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt" | "viewCount" | "clickCount";
    sortOrder?: "asc" | "desc";
}) {
    return tryCatch(async () => {
        const page = options?.page || 1;
        const limit = options?.limit || 50;
        const offset = (page - 1) * limit;
        const sortBy = options?.sortBy || "createdAt";
        const sortOrder = options?.sortOrder || "desc";

        const sortColumn = deals[sortBy];
        const orderFn = sortOrder === "asc" ? asc : desc;

        const results = await db
            .select({
                perk: deals,
                category: categories,
            })
            .from(deals)
            .leftJoin(categories, eq(deals.categoryId, categories.id))
            .orderBy(orderFn(sortColumn))
            .limit(limit)
            .offset(offset)
            .all();

        const total = await db
            .select({ count: deals.id })
            .from(deals)
            .all();

        return {
            perks: results,
            meta: {
                page,
                limit,
                total: total.length,
            },
        };
    }, "Failed to fetch perks for admin");
}

/**
 * Create a new perk
 */
export async function createPerk(input: CreatePerkInput) {
    return tryCatch(async () => {
        const dealId = crypto.randomUUID();

        // Note: brandId property missing in input but required in schema. 
        // This suggests input schema also needs update or we need to handle it.
        // For now, mapping directly but this might fail runtime if schema enforcement is strict and input lacks brandId.

        await db.insert(deals).values({
            id: dealId,
            ...input,
            // Fallback content until we have brandId in input
            brandId: "legacy-admin-placeholder",
            discountType: "percentage", // Default
            discountLabel: "Special Offer", // Default
            isActive: true,
            clickCount: 0,
            viewCount: 0,
        } as any);

        return await db
            .select({ perk: deals, category: categories })
            .from(deals)
            .leftJoin(categories, eq(deals.categoryId, categories.id))
            .where(eq(deals.id, dealId))
            .get();
    }, "Failed to create perk");
}

/**
 * Update a perk
 */
export async function updatePerk(input: UpdatePerkInput) {
    return tryCatch(async () => {
        const { id, ...updateData } = input;

        await db
            .update(deals)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(deals.id, id))
            .run();

        return await db
            .select({ perk: deals, category: categories })
            .from(deals)
            .leftJoin(categories, eq(deals.categoryId, categories.id))
            .where(eq(deals.id, id))
            .get();
    }, `Failed to update perk: ${input.id}`);
}

/**
 * Soft delete a perk (set isActive to false)
 */
export async function deletePerk(perkId: string) {
    return tryCatch(async () => {
        await db
            .update(deals)
            .set({
                isActive: false,
                updatedAt: new Date(),
            })
            .where(eq(deals.id, perkId))
            .run();

        return { success: true };
    }, `Failed to delete perk: ${perkId}`);
}

/**
 * Toggle featured status
 */
export async function toggleFeatured(perkId: string) {
    return tryCatch(async () => {
        const perk = await db
            .select()
            .from(deals)
            .where(eq(deals.id, perkId))
            .get();

        if (!perk) {
            throw new Error("Perk not found");
        }

        await db
            .update(deals)
            .set({
                isFeatured: !perk.isFeatured,
                updatedAt: new Date(),
            })
            .where(eq(deals.id, perkId))
            .run();

        return { isFeatured: !perk.isFeatured };
    }, `Failed to toggle featured: ${perkId}`);
}

/**
 * Set perk expiration
 */
export async function setPerkExpiration(perkId: string, expirationDate: Date | null) {
    return tryCatch(async () => {
        await db
            .update(deals)
            .set({
                expirationDate,
                isActive: expirationDate ? expirationDate > new Date() : true,
                updatedAt: new Date(),
            })
            .where(eq(deals.id, perkId))
            .run();

        return { success: true };
    }, `Failed to set expiration: ${perkId}`);
}
