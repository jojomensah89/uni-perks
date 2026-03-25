export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
}

// Legacy public-facing "Perk" card data shape used in marketing pages.
export interface Perk {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    company: string;
    companyLogo?: string;
    valueAmount?: number;
    valueCurrency?: string;
    categoryId?: string;
    availableCountries?: string[];
    excludedCountries?: string[];
    isGlobal?: boolean;
    region?: string;
    regionNotes?: string;
    verificationMethod?: string;
    claimUrl?: string;
    affiliateUrl?: string;
    isFeatured?: boolean;
    status?: "draft" | "published" | "archived";
    expirationDate?: string;
    metaTitle?: string;
    metaDescription?: string;
    clickCount?: number;
    viewCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface GeoData {
    country: string;
    region: string;
    continent: string;
    city?: string;
}

export interface APIResponse<T> {
    data: T;
    meta?: any;
}
