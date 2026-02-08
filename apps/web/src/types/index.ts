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
    availableCountries?: string[];
    excludedCountries?: string[];
    isGlobal: boolean;
    region?: string;
    verificationMethod: string;
    claimUrl: string;
    affiliateUrl?: string;
    isFeatured: boolean;
    isActive: boolean;
    createdAt: string; // ISO string from JSON
    viewCount: number;
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
