const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://uni-perks.com';

export interface DealForSchema {
    slug: string;
    title: string;
    shortDescription: string;
    discountLabel: string;
    studentPrice?: number | null;
    originalPrice?: number | null;
    currency?: string | null;
    brand: {
        name: string;
        slug?: string;
        website?: string;
    };
    category: {
        name: string;
        slug: string;
    };
}

export interface CategoryForSchema {
    name: string;
    slug: string;
}

export interface RegionForSchema {
    code: string;
    name: string;
}

export interface BrandForSchema {
    name: string;
    slug: string;
    website?: string;
}

/**
 * Generates ItemList schema for curation pages
 * Pattern: "Best [Category] Student Discounts"
 */
export function generateCurationSchema(params: {
    deals: DealForSchema[];
    categoryName: string;
    categorySlug: string;
}) {
    const { deals, categoryName, categorySlug } = params;

    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Best ${categoryName} Student Discounts`,
        description: `Curated list of verified student discounts for ${categoryName}`,
        url: `${SITE_URL}/student-discounts/${categorySlug}`,
        numberOfItems: deals.length,
        itemListElement: deals.map((deal, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Offer',
                name: deal.title,
                description: deal.shortDescription,
                url: `${SITE_URL}/deals/${deal.slug}`,
                seller: {
                    '@type': 'Organization',
                    name: deal.brand.name,
                },
                price: deal.studentPrice?.toString() || '0',
                priceCurrency: deal.currency || 'USD',
            },
        })),
    };
}

/**
 * Generates ItemList schema for location pages
 * Pattern: "Student Discounts in [Region]"
 */
export function generateLocationSchema(params: {
    deals: DealForSchema[];
    region: RegionForSchema;
}) {
    const { deals, region } = params;

    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Student Discounts in ${region.name}`,
        description: `Verified student discounts available for students in ${region.name}`,
        url: `${SITE_URL}/student-discounts/in/${region.code.toLowerCase()}`,
        numberOfItems: deals.length,
        areaServed: {
            '@type': 'Country',
            name: region.name,
        },
        itemListElement: deals.map((deal, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Offer',
                name: deal.title,
                description: deal.shortDescription,
                url: `${SITE_URL}/deals/${deal.slug}`,
                seller: {
                    '@type': 'Organization',
                    name: deal.brand.name,
                },
                areaServed: region.name,
            },
        })),
    };
}

/**
 * Generates comparison schema for brand comparison pages
 * Pattern: "[Brand A] vs [Brand B] Student Discount"
 */
export function generateComparisonSchema(params: {
    brandA: BrandForSchema;
    brandB: BrandForSchema;
    dealA?: DealForSchema;
    dealB?: DealForSchema;
    category: CategoryForSchema;
}) {
    const { brandA, brandB, dealA, dealB, category } = params;

    const offers: any[] = [];

    if (dealA) {
        offers.push({
            '@type': 'Offer',
            name: `${brandA.name} Student Discount`,
            description: dealA.shortDescription,
            url: `${SITE_URL}/brands/${brandA.slug}`,
            seller: {
                '@type': 'Organization',
                name: brandA.name,
                url: brandA.website,
            },
            price: dealA.studentPrice?.toString() || '0',
            priceCurrency: dealA.currency || 'USD',
        });
    }

    if (dealB) {
        offers.push({
            '@type': 'Offer',
            name: `${brandB.name} Student Discount`,
            description: dealB.shortDescription,
            url: `${SITE_URL}/brands/${brandB.slug}`,
            seller: {
                '@type': 'Organization',
                name: brandB.name,
                url: brandB.website,
            },
            price: dealB.studentPrice?.toString() || '0',
            priceCurrency: dealB.currency || 'USD',
        });
    }

    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${brandA.name} vs ${brandB.name} Student Discount Comparison`,
        description: `Compare student discounts from ${brandA.name} and ${brandB.name} in ${category.name}`,
        url: `${SITE_URL}/compare/${brandA.slug}-vs-${brandB.slug}`,
        numberOfItems: offers.length,
        itemListElement: offers.map((offer, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: offer,
        })),
    };
}

/**
 * Generates ItemList schema for persona pages
 * Pattern: "Student Discounts for [Persona]"
 */
export function generatePersonaSchema(params: {
    deals: DealForSchema[];
    personaName: string;
    personaSlug: string;
}) {
    const { deals, personaName, personaSlug } = params;

    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Student Discounts for ${personaName}`,
        description: `Curated student deals selected for ${personaName}`,
        url: `${SITE_URL}/for/${personaSlug}`,
        numberOfItems: deals.length,
        itemListElement: deals.map((deal, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Offer',
                name: deal.title,
                description: deal.shortDescription,
                url: `${SITE_URL}/deals/${deal.slug}`,
                seller: {
                    '@type': 'Organization',
                    name: deal.brand.name,
                },
                price: deal.studentPrice?.toString() || '0',
                priceCurrency: deal.currency || 'USD',
            },
        })),
    };
}

/**
 * Generates FAQ schema for any pSEO page
 */
export function generateFaqSchema(faqs: Array<{ question: string; answer: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

/**
 * Generates BreadcrumbList schema for pSEO pages
 */
export function generatePseoBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
        })),
    };
}
