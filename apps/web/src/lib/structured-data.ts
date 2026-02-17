interface Deal {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    longDescription: string;
    discountLabel: string;
    studentPrice?: number;
    originalPrice?: number;
    currency?: string;
    createdAt: string;
    expirationDate?: string;
    brand: {
        name: string;
        website?: string;
    };
}

interface Brand {
    name: string;
    website?: string;
    description?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://uni-perks.com';

export function generateDealStructuredData(deal: Deal) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Offer',
        name: deal.title,
        description: deal.longDescription,
        seller: {
            '@type': 'Organization',
            name: deal.brand.name,
            url: deal.brand.website || `${SITE_URL}/brands/${deal.brand.name.toLowerCase().replace(/\s+/g, '-')}`,
        },
        price: deal.studentPrice?.toString() || '0',
        priceCurrency: deal.currency || 'USD',
        availability: 'https://schema.org/InStock',
        validFrom: deal.createdAt,
        ...(deal.expirationDate && { validThrough: deal.expirationDate }),
        url: `${SITE_URL}/deals/${deal.slug}`,
        priceValidUntil: deal.expirationDate,
    };
}

export function generateBrandStructuredData(brand: Brand) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: brand.name,
        description: brand.description,
        url: brand.website,
    };
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

export function generateWebsiteStructuredData() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'UniPerks',
        url: SITE_URL,
        description: 'The best student discounts and perks. Zero signup required.',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

export function generateItemListStructuredData(deals: Deal[], listName: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: listName,
        itemListElement: deals.map((deal, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Offer',
                name: deal.title,
                description: deal.shortDescription,
                url: `${SITE_URL}/deals/${deal.slug}`,
            },
        })),
    };
}

/**
 * Helper to inject structured data into page
 * Usage: <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
 */
export function injectStructuredData(data: object) {
    return JSON.stringify(data);
}
