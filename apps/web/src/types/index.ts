export interface Perk {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    longDescription: string;
    company: string;
    companyLogo?: string;
    valueAmount?: number;
    valueCurrency: string;
    categoryId: string;
    availableCountries?: string[];
    excludedCountries?: string[];
    isGlobal: boolean;
    region?: string;
    regionNotes?: string;
    displayPriority?: number;
    countryUrls?: Record<string, string>;
    countryValues?: Record<string, number>;
    verificationMethod: string;
    eligibilityNote?: string;
    claimUrl: string;
    affiliateUrl?: string;
    isFeatured: boolean;
    isActive: boolean;
    expirationDate?: string;
    lastVerified?: string;
    metaTitle?: string;
    metaDescription?: string;
    clickCount: number;
    viewCount: number;
    createdAt: string; // ISO string from JSON
    updatedAt: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
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
