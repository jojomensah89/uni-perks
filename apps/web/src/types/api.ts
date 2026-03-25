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

export type ApiDealResponse = {
    deal: {
        id: string;
        title: string;
        slug: string;
        discountType: "percent" | "fixed" | "other";
        discountValue: number | null;
        discountLabel: string;
        shortDescription?: string;
        longDescription?: string | null;
        coverImageUrl?: string | null;
        originalPrice?: number | null;
        studentPrice?: number | null;
        currency?: string;
        claimUrl?: string;
        affiliateUrl?: string;
        verificationMethod?: string;
        eligibilityNote?: string;
        howToRedeem?: string;
        conditions?: string;
        termsUrl?: string;
        minimumSpend?: number | null;
        isNewCustomerOnly?: boolean;
        status: "draft" | "published" | "archived";
        isFeatured: boolean;
        expirationDate?: string | number | null;
        metaTitle?: string;
        metaDescription?: string;
        createdAt?: string;
    };
    brand: ApiBrandResponse;
    category: ApiCategoryResponse;
};
