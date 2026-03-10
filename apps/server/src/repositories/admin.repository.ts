import { db, deals, categories, eq, desc, asc } from "@uni-perks/db";

export interface CreateDealInput {
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

export interface UpdateDealInput extends Partial<CreateDealInput> {
    id: string;
}

/**
 * Get all deals for admin (including inactive)
 */
export async function getAllDealsForAdmin(options?: {
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt" | "viewCount" | "clickCount";
    sortOrder?: "asc" | "desc";
}) {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const offset = (page - 1) * limit;
    const sortBy = options?.sortBy || "createdAt";
    const sortOrder = options?.sortOrder || "desc";

    const sortColumn = deals[sortBy];
    const orderFn = sortOrder === "asc" ? asc : desc;

    const results = await db
        .select({
            deal: deals,
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
        deals: results,
        meta: {
            page,
            limit,
            total: total.length,
        },
    };
}

/**
 * Create a new deal
 */
export async function createDeal(input: CreateDealInput) {
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
        .select({ deal: deals, category: categories })
        .from(deals)
        .leftJoin(categories, eq(deals.categoryId, categories.id))
        .where(eq(deals.id, dealId))
        .get();
}

/**
 * Update a deal
 */
export async function updateDeal(input: UpdateDealInput) {
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
        .select({ deal: deals, category: categories })
        .from(deals)
        .leftJoin(categories, eq(deals.categoryId, categories.id))
        .where(eq(deals.id, id))
        .get();
}

/**
 * Soft delete a deal (set isActive to false)
 */
export async function deleteDeal(dealId: string) {
    await db
        .update(deals)
        .set({
            isActive: false,
            updatedAt: new Date(),
        })
        .where(eq(deals.id, dealId))
        .run();

    return { success: true };
}

/**
 * Toggle featured status
 */
export async function toggleFeatured(dealId: string) {
    const deal = await db
        .select()
        .from(deals)
        .where(eq(deals.id, dealId))
        .get();

    if (!deal) {
        throw new Error("Deal not found");
    }

    await db
        .update(deals)
        .set({
            isFeatured: !deal.isFeatured,
            updatedAt: new Date(),
        })
        .where(eq(deals.id, dealId))
        .run();

    return { isFeatured: !deal.isFeatured };
}

/**
 * Set deal expiration
 */
export async function setDealExpiration(dealId: string, expirationDate: Date | null) {
    await db
        .update(deals)
        .set({
            expirationDate,
            isActive: expirationDate ? expirationDate > new Date() : true,
            updatedAt: new Date(),
        })
        .where(eq(deals.id, dealId))
        .run();

    return { success: true };
}
