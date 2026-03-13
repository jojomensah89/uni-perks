import type { Metadata } from 'next';

interface Deal {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    longDescription: string;
    discountLabel: string;
    brand: {
        name: string;
        logoUrl?: string;
        coverImageUrl?: string;
    };
    category: {
        name: string;
        slug: string;
    };
}

interface Brand {
    slug: string;
    name: string;
    tagline?: string;
    description?: string;
    coverImageUrl?: string;
}

interface Collection {
    slug: string;
    name: string;
    description?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://uni-perks.com';
const SITE_NAME = 'UniPerks';

export function generateDealMetadata(deal: Deal): Metadata {
    const title = `${deal.discountLabel} - ${deal.brand.name} Student Discount | ${SITE_NAME}`;
    const description = deal.shortDescription.slice(0, 160);
    const imageUrl = deal.brand.coverImageUrl || `${SITE_URL}/og-default.png`;

    return {
        title,
        description,
        openGraph: {
            title: `${deal.discountLabel} on ${deal.brand.name}`,
            description,
            images: [{ url: imageUrl, width: 1200, height: 630 }],
            type: 'website',
            siteName: SITE_NAME,
            url: `${SITE_URL}/deals/${deal.slug}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${deal.discountLabel} - ${deal.brand.name}`,
            description,
            images: [imageUrl],
        },
        alternates: {
            canonical: `${SITE_URL}/deals/${deal.slug}`,
        },
    };
}

export function generateBrandMetadata(brand: Brand): Metadata {
    const title = `${brand.name} Student Discounts & Deals | ${SITE_NAME}`;
    const description = brand.description?.slice(0, 160) || `Discover exclusive ${brand.name} student discounts and deals. Save money on ${brand.tagline || brand.name}.`;
    const imageUrl = brand.coverImageUrl || `${SITE_URL}/og-default.png`;

    return {
        title,
        description,
        openGraph: {
            title: `${brand.name} Student Deals`,
            description,
            images: [{ url: imageUrl, width: 1200, height: 630 }],
            type: 'website',
            siteName: SITE_NAME,
            url: `${SITE_URL}/brands/${brand.slug}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${brand.name} Student Deals`,
            description,
            images: [imageUrl],
        },
        alternates: {
            canonical: `${SITE_URL}/brands/${brand.slug}`,
        },
    };
}

export function generateCollectionMetadata(collection: Collection): Metadata {
    const title = `${collection.name} - Curated Student Deals | ${SITE_NAME}`;
    const description = collection.description?.slice(0, 160) || `Explore our ${collection.name} collection of exclusive student discounts and deals.`;

    return {
        title,
        description,
        openGraph: {
            title: collection.name,
            description,
            images: [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630 }],
            type: 'website',
            siteName: SITE_NAME,
            url: `${SITE_URL}/collections/${collection.slug}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: collection.name,
            description,
        },
        alternates: {
            canonical: `${SITE_URL}/collections/${collection.slug}`,
        },
    };
}

export function generateCategoryMetadata(categoryName: string, categorySlug: string): Metadata {
    const title = `${categoryName} Student Discounts | ${SITE_NAME}`;
    const description = `Browse the best ${categoryName.toLowerCase()} student discounts and deals. Save money on top brands and services.`;

    return {
        title,
        description,
        openGraph: {
            title: `${categoryName} Student Deals`,
            description,
            images: [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630 }],
            type: 'website',
            siteName: SITE_NAME,
            url: `${SITE_URL}/categories/${categorySlug}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${categoryName} Student Deals`,
            description,
        },
        alternates: {
            canonical: `${SITE_URL}/categories/${categorySlug}`,
        },
    };
}

export function generateHomeMetadata(): Metadata {
    const title = `${SITE_NAME} - Best Student Discounts & Perks`;
    const description = 'Discover exclusive student discounts on tech, streaming, food, fashion, and more. Save money with verified student deals. No signup required.';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [{ url: `${SITE_URL}/og-home.png`, width: 1200, height: 630 }],
            type: 'website',
            siteName: SITE_NAME,
            url: SITE_URL,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`${SITE_URL}/og-home.png`],
        },
        alternates: {
            canonical: SITE_URL,
        },
    };
}

