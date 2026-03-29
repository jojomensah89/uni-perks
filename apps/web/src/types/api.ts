export type ApiBrandResponse = {
    id: string;
    name: string;
    slug: string;
    tagline?: string;
    description?: string;
    logoUrl?: string | null;
    coverImageUrl?: string | null;
    website?: string;
    whyWeLoveIt?: string;
    isVerified: boolean;
    totalClickCount: number;
    metaTitle?: string;
    metaDescription?: string;
    createdAt: string;
    updatedAt: string;
};

export type ApiCategoryResponse = {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
    coverImageUrl?: string | null;
    displayOrder: number;
    metaTitle?: string;
    metaDescription?: string;
    createdAt: string;
};

export type DealStatus = "pending" | "approved" | "rejected" | "published" | "archived";

export type ApiDealResponse = {
    deal: {
        id: string;
        title: string;
        slug: string;
        discountType: string;
        discountValue: number | null;
        discountLabel: string;
        shortDescription?: string;
        longDescription?: string;
        coverImageUrl?: string | null;
        originalPrice?: number | null;
        currency?: string;
        claimUrl?: string;
        affiliateLink?: string;
        howToRedeem?: string;
        conditions?: string;
        termsUrl?: string;
        minimumSpend?: number | null;
        isFeatured: boolean;
        status: DealStatus;
        expiresAt?: string | number | null;
        hotnessScore?: number | null;
        approvedAt?: string | number | null;
        metaTitle?: string;
        metaDescription?: string;
        clickCount?: number;
        viewCount?: number;
        createdAt?: string;
        updatedAt?: string;
    };
    brand: ApiBrandResponse;
    category: ApiCategoryResponse;
};
