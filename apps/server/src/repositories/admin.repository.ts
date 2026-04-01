import { db, deals, brands, categories, eq, desc, asc, sql } from "@uni-perks/db";

// Input types matching the current deals schema
export interface CreateDealInput {
    slug: string;
    title: string;
    shortDescription: string;
    longDescription: string;
    brandId: string;
    categoryId: string;
    discountType: string;
    discountLabel: string;
    discountValue?: number | null;
    originalPrice?: number | null;
    currency?: string;
    claimUrl: string;
    affiliateLink?: string | null;
    coverImageUrl?: string | null;
    howToRedeem?: string | null;
    termsUrl?: string | null;
    minimumSpend?: number | null;
    isFeatured?: boolean;
    status?: "pending" | "approved" | "rejected" | "published" | "archived";
    hotnessScore?: number;
    conditions?: string | null;
    expiresAt?: Date | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
}

export interface UpdateDealInput extends Partial<CreateDealInput> {
    id: string;
}

/**
 * Get all deals for admin (including inactive) with brand and category joins
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
            brand: brands,
            category: categories,
        })
        .from(deals)
        .leftJoin(brands, eq(deals.brandId, brands.id))
        .leftJoin(categories, eq(deals.categoryId, categories.id))
        .orderBy(orderFn(sortColumn))
        .limit(limit)
        .offset(offset)
        .all();

    const [totalResult] = await db
        .select({ total: sql<number>`count(*)` })
        .from(deals);

    return {
        deals: results,
        meta: {
            page,
            limit,
            total: totalResult?.total || 0,
        },
    };
}

/**
 * Create a new deal
 */
export async function createDeal(input: CreateDealInput) {
    const [created] = await db
        .insert(deals)
        .values({
            slug: input.slug,
            title: input.title,
            shortDescription: input.shortDescription,
            longDescription: input.longDescription,
            brandId: input.brandId,
            categoryId: input.categoryId,
            discountType: input.discountType,
            discountLabel: input.discountLabel,
            discountValue: input.discountValue ?? null,
            originalPrice: input.originalPrice ?? null,
            currency: input.currency ?? "USD",
            claimUrl: input.claimUrl,
            affiliateLink: input.affiliateLink ?? null,
            coverImageUrl: input.coverImageUrl ?? null,
            howToRedeem: input.howToRedeem ?? null,
            termsUrl: input.termsUrl ?? null,
            minimumSpend: input.minimumSpend ?? null,
            isFeatured: input.isFeatured ?? false,
            status: input.status ?? "pending",
            hotnessScore: input.hotnessScore ?? 50,
            conditions: input.conditions ?? null,
            expiresAt: input.expiresAt ?? null,
            metaTitle: input.metaTitle ?? null,
            metaDescription: input.metaDescription ?? null,
        })
        .returning();

    if (!created) {
        throw new Error("Failed to create deal");
    }

    // Fetch with joins for response
    const [result] = await db
        .select({
            deal: deals,
            brand: brands,
            category: categories,
        })
        .from(deals)
        .leftJoin(brands, eq(deals.brandId, brands.id))
        .leftJoin(categories, eq(deals.categoryId, categories.id))
        .where(eq(deals.id, created.id));

    return result;
}

/**
 * Update a deal
 */
export async function updateDeal(input: UpdateDealInput) {
    const { id, ...updateData } = input;

    // Build update object with only provided fields
    const updatePayload: Record<string, unknown> = {};

    if (updateData.slug !== undefined) updatePayload.slug = updateData.slug;
    if (updateData.title !== undefined) updatePayload.title = updateData.title;
    if (updateData.shortDescription !== undefined) updatePayload.shortDescription = updateData.shortDescription;
    if (updateData.longDescription !== undefined) updatePayload.longDescription = updateData.longDescription;
    if (updateData.brandId !== undefined) updatePayload.brandId = updateData.brandId;
    if (updateData.categoryId !== undefined) updatePayload.categoryId = updateData.categoryId;
    if (updateData.discountType !== undefined) updatePayload.discountType = updateData.discountType;
    if (updateData.discountLabel !== undefined) updatePayload.discountLabel = updateData.discountLabel;
    if (updateData.discountValue !== undefined) updatePayload.discountValue = updateData.discountValue;
    if (updateData.originalPrice !== undefined) updatePayload.originalPrice = updateData.originalPrice;
    if (updateData.currency !== undefined) updatePayload.currency = updateData.currency;
    if (updateData.claimUrl !== undefined) updatePayload.claimUrl = updateData.claimUrl;
    if (updateData.affiliateLink !== undefined) updatePayload.affiliateLink = updateData.affiliateLink;
    if (updateData.coverImageUrl !== undefined) updatePayload.coverImageUrl = updateData.coverImageUrl;
    if (updateData.howToRedeem !== undefined) updatePayload.howToRedeem = updateData.howToRedeem;
    if (updateData.termsUrl !== undefined) updatePayload.termsUrl = updateData.termsUrl;
    if (updateData.minimumSpend !== undefined) updatePayload.minimumSpend = updateData.minimumSpend;
    if (updateData.isFeatured !== undefined) updatePayload.isFeatured = updateData.isFeatured;
    if (updateData.status !== undefined) updatePayload.status = updateData.status;
    if (updateData.hotnessScore !== undefined) updatePayload.hotnessScore = updateData.hotnessScore;
    if (updateData.conditions !== undefined) updatePayload.conditions = updateData.conditions;
    if (updateData.expiresAt !== undefined) updatePayload.expiresAt = updateData.expiresAt;
    if (updateData.metaTitle !== undefined) updatePayload.metaTitle = updateData.metaTitle;
    if (updateData.metaDescription !== undefined) updatePayload.metaDescription = updateData.metaDescription;

    await db
        .update(deals)
        .set(updatePayload)
        .where(eq(deals.id, id));

    // Fetch with joins for response
    const [result] = await db
        .select({
            deal: deals,
            brand: brands,
            category: categories,
        })
        .from(deals)
        .leftJoin(brands, eq(deals.brandId, brands.id))
        .leftJoin(categories, eq(deals.categoryId, categories.id))
        .where(eq(deals.id, id));

    return result;
}

/**
 * Soft delete a deal (set status to archived)
 */
export async function deleteDeal(dealId: string) {
    await db
        .update(deals)
        .set({
            status: "archived",
        })
        .where(eq(deals.id, dealId));

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
        })
        .where(eq(deals.id, dealId));

    return { isFeatured: !deal.isFeatured };
}

/**
 * Set deal expiration
 */
export async function setDealExpiration(dealId: string, expiresAt: Date | null) {
    await db
        .update(deals)
        .set({
            expiresAt,
        })
        .where(eq(deals.id, dealId));

    return { success: true };
}
