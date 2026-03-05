import type { ApiDealResponse } from "@/components/DealCard";

const CURRENT_YEAR = new Date().getFullYear();

export interface PseoContent {
    h1: string;
    introduction: string;
    sections: Array<{
        heading: string;
        body: string;
    }>;
    faqs: Array<{
        question: string;
        answer: string;
    }>;
    callToAction?: string;
}

export interface CategoryInfo {
    name: string;
    slug: string;
}

export interface RegionInfo {
    code: string;
    name: string;
}

export interface BrandInfo {
    name: string;
    slug: string;
}

export interface TagInfo {
    name: string;
    slug: string;
}

export interface PersonaInfo {
    name: string;
    shortName: string;
    slug: string;
    description?: string;
    painPoints?: string[];
}

/**
 * Generates content for CURATION playbook pages
 * Pattern: "Best [Category] Student Discounts"
 */
export function generateCurationContent(params: {
    category: CategoryInfo;
    deals: ApiDealResponse[];
    relatedCategories: CategoryInfo[];
}): PseoContent {
    const { category, deals, relatedCategories } = params;

    const h1 = `Best ${category.name} Student Discounts in ${CURRENT_YEAR}`;
    
    const introduction = `Discover the top student discounts on ${category.name.toLowerCase()} products and services. We've curated ${deals.length} verified offers from popular brands, helping you save money while studying. All deals are verified and updated regularly.`;

    // Generate deal summaries
    const dealSummaries = deals.slice(0, 5).map((dealWrapper) => {
        const deal = dealWrapper.deal;
        const brand = dealWrapper.brand;
        return `**${brand.name}** offers ${deal.discountLabel} for students. ${deal.shortDescription}`;
    }).join('\n\n');

    const sections = [
        {
            heading: `Top ${category.name} Student Deals`,
            body: dealSummaries,
        },
        {
            heading: 'How to Claim These Discounts',
            body: `Most ${category.name.toLowerCase()} student discounts require verification through services like UNiDAYS, Student Beans, SheerID, or a valid .edu email address. Simply click on any deal above, verify your student status, and start saving. Each discount has specific eligibility requirements listed on the deal page.`,
        },
        {
            heading: 'Why Students Love These Deals',
            body: `Being a student can be expensive, but these ${category.name.toLowerCase()} discounts help stretch your budget further. Whether you need tools for your coursework, entertainment for downtime, or everyday essentials, these verified offers provide genuine savings without the hassle of hunting for promo codes.`,
        },
    ];

    const faqs = [
        {
            question: `How do I verify my student status for ${category.name} discounts?`,
            answer: `Most brands accept verification through UNiDAYS, Student Beans, SheerID, or a valid .edu email address. Some may require you to upload a photo of your student ID or provide proof of enrollment.`,
        },
        {
            question: `Are these ${category.name.toLowerCase()} student discounts legit?`,
            answer: `Yes! All deals listed on UniPerks are verified and regularly updated. We only feature discounts from reputable brands with clear verification processes.`,
        },
        {
            question: `How often are ${category.name.toLowerCase()} student deals updated?`,
            answer: `We update our listings weekly and verify each deal monthly. Expired or changed offers are marked or removed to ensure you always see current, working discounts.`,
        },
    ];

    return { h1, introduction, sections, faqs };
}

/**
 * Generates content for LOCATION playbook pages
 * Pattern: "Student Discounts in [Region]"
 */
export function generateLocationContent(params: {
    region: RegionInfo;
    deals: ApiDealResponse[];
    categories: CategoryInfo[];
}): PseoContent {
    const { region, deals, categories } = params;

    const h1 = `Student Discounts Available in ${region.name}`;
    
    const introduction = `Find ${deals.length} student discounts and deals available for students in ${region.name}. Whether you're studying locally or abroad, these verified offers help you save on tech, entertainment, food, fashion, and more.`;

    // Group deals by verification method
    const verificationMethods = new Set(deals.map(d => d.deal.verificationMethod));
    const verificationInfo = Array.from(verificationMethods).join(', ');

    const sections = [
        {
            heading: `${region.name} Student Deals Overview`,
            body: `Students in ${region.name} can access ${deals.length} exclusive discounts from top brands. Popular verification methods in this region include ${verificationInfo}. Click any deal to see full eligibility requirements and how to claim.`,
        },
        {
            heading: 'Regional Verification Tips',
            body: getRegionVerificationTips(region.code),
        },
        {
            heading: 'Popular Categories',
            body: categories.slice(0, 4).map(c => `- [${c.name}](/student-discounts/${c.slug})`).join('\n'),
        },
    ];

    const faqs = [
        {
            question: `Do I need a ${region.name} student ID to claim these discounts?`,
            answer: `Requirements vary by brand. Some accept international student IDs, while others require local verification. Check each deal's eligibility section for specific requirements.`,
        },
        {
            question: `Can international students in ${region.name} access these deals?`,
            answer: `Many deals are available to international students with valid student status. Verification services like SheerID often work with international universities.`,
        },
        {
            question: `Are online discounts available in ${region.name}?`,
            answer: `Most deals work online regardless of location. Physical store discounts may have regional restrictions, which are noted on each deal page.`,
        },
    ];

    return { h1, introduction, sections, faqs };
}

/**
 * Generates content for COMPARISON playbook pages
 * Pattern: "[Brand A] vs [Brand B] Student Discount"
 */
export function generateComparisonContent(params: {
    brandA: BrandInfo;
    brandB: BrandInfo;
    brandADeals: ApiDealResponse[];
    brandBDeals: ApiDealResponse[];
    category: CategoryInfo;
}): PseoContent {
    const { brandA, brandB, brandADeals, brandBDeals, category } = params;

    const h1 = `${brandA.name} vs ${brandB.name}: Student Discount Comparison`;
    
    const introduction = `Compare student discounts from ${brandA.name} and ${brandB.name} side by side. Both brands offer ${category.name.toLowerCase()} deals for students, but which one gives you better value? We break down the discounts, verification requirements, and best use cases.`;

    const dealA = brandADeals[0]?.deal;
    const dealB = brandBDeals[0]?.deal;

    const sections = [
        {
            heading: 'Discount Comparison',
            body: `| Feature | ${brandA.name} | ${brandB.name} |
|---------|-------------|-------------|
| Discount | ${dealA?.discountLabel || 'N/A'} | ${dealB?.discountLabel || 'N/A'} |
| Verification | ${dealA?.verificationMethod || 'N/A'} | ${dealB?.verificationMethod || 'N/A'} |
| Student Price | ${dealA?.studentPrice ? `$${dealA.studentPrice}` : 'N/A'} | ${dealB?.studentPrice ? `$${dealB.studentPrice}` : 'N/A'} |`,
        },
        {
            heading: `Choose ${brandA.name} if...`,
            body: getChooseRecommendation(brandA, dealA, brandB, dealB),
        },
        {
            heading: `Choose ${brandB.name} if...`,
            body: getChooseRecommendation(brandB, dealB, brandA, dealA),
        },
        {
            heading: 'Our Verdict',
            body: getVerdict(brandA, brandB, dealA, dealB),
        },
    ];

    const faqs = [
        {
            question: `Can I use both ${brandA.name} and ${brandB.name} student discounts?`,
            answer: `Yes! These are separate deals from different brands. You can verify with each brand independently and claim both discounts.`,
        },
        {
            question: `Which verification method is easier for ${brandA.name} vs ${brandB.name}?`,
            answer: `${dealA?.verificationMethod || 'N/A'} for ${brandA.name} vs ${dealB?.verificationMethod || 'N/A'} for ${brandB.name}. Both typically accept .edu emails or student ID verification.`,
        },
        {
            question: `Do ${brandA.name} and ${brandB.name} stack student discounts with other offers?`,
            answer: `Stacking policies vary. Check each brand's terms for details on combining student discounts with sales, promo codes, or other promotions.`,
        },
    ];

    return { h1, introduction, sections, faqs };
}

/**
 * Generates content for PERSONA playbook pages
 * Pattern: "Student Discounts for [Persona]"
 */
export function generatePersonaContent(params: {
    persona: PersonaInfo;
    deals: ApiDealResponse[];
    categories: CategoryInfo[];
}): PseoContent {
    const { persona, deals, categories } = params;

    const h1 = `Best Student Discounts for ${persona.name}`;
    
    const introduction = persona.description || 
        `Curated ${deals.length} student discounts specifically chosen for ${persona.shortName}. These deals address common student needs in this field, from productivity tools to creative software and learning resources.`;

    const sections = [
        {
            heading: `${persona.shortName} Essential Deals`,
            body: `These ${deals.length} deals are selected for their relevance to ${persona.shortName.toLowerCase()}. Each offer provides tools, services, or resources that support your studies and career preparation.`,
        },
        {
            heading: 'Common Challenges & Solutions',
            body: persona.painPoints?.map(point => `- ${point}`).join('\n') || 
                'Access to professional tools, learning resources, and productivity software at reduced prices.',
        },
        {
            heading: 'How to Maximize Your Savings',
            body: `1. Sign up for verification services like UNiDAYS and Student Beans early\n2. Check back regularly as brands add new student-exclusive offers\n3. Stack deals with back-to-school promotions when available\n4. Some brands offer extended trials or free months for students`,
        },
    ];

    const faqs = [
        {
            question: `What makes these deals relevant for ${persona.shortName}?`,
            answer: `We've selected deals based on tools, services, and resources commonly used in ${persona.name.toLowerCase()} studies and careers. Each deal addresses specific needs relevant to your field.`,
        },
        {
            question: `How often do you update ${persona.shortName.toLowerCase()}-focused deals?`,
            answer: `We update our listings weekly and add new deals as brands release student-focused offers. Bookmark this page to stay informed about new discounts.`,
        },
        {
            question: `Can I suggest deals for ${persona.shortName.toLowerCase()}?`,
            answer: `Yes! Use our suggestion feature to recommend new deals. We review all submissions and add qualifying offers to help fellow students save.`,
        },
    ];

    return { h1, introduction, sections, faqs };
}

// Helper functions

function getRegionVerificationTips(regionCode: string): string {
    const tips: Record<string, string> = {
        US: 'Most US brands accept .edu email addresses for instant verification. Services like SheerID and UNiDAYS are widely supported.',
        GB: 'UK students can use NUS cards, Student Beans, or UNiDAYS for verification. Many brands also accept ac.uk email addresses.',
        CA: 'Canadian students can verify through Student Beans, UNiDAYS, or with .ca university emails. Some brands may require additional documentation.',
        AU: 'Australian universities often use .edu.au domains for verification. UNiDAYS and Student Beans both support Australian institutions.',
        DE: 'German students can use Student Beans, UNiDAYS, or upload their Immatrikulationsbescheinigung (enrollment certificate).',
        FR: 'French students can verify with Student Beans, UNiDAYS, or by providing their carte d\'étudiant (student card).',
        GLOBAL: 'Global deals typically use SheerID verification which works with universities worldwide. Check each deal for specific requirements.',
    };
    return tips[regionCode] || 'Most brands accept verification through international services like SheerID, UNiDAYS, or Student Beans.';
}

function getChooseRecommendation(
    brand: BrandInfo, 
    deal: any, 
    otherBrand: BrandInfo, 
    otherDeal: any
): string {
    if (!deal) return `Check current offers for the best deal.`;
    
    const reasons: string[] = [];
    
    if (deal.discountType === 'free' || deal.discountType === 'trial') {
        reasons.push(`You want to try before committing (offers ${deal.discountLabel})`);
    }
    if (deal.discountValue && otherDeal?.discountValue && deal.discountValue > otherDeal.discountValue) {
        reasons.push(`You want the deeper discount (${deal.discountValue}% vs ${otherDeal.discountValue}%)`);
    }
    if (deal.verificationMethod === 'edu_email') {
        reasons.push(`You prefer quick email verification`);
    }
    if (deal.isNewCustomerOnly) {
        reasons.push(`You're a new customer looking for the best sign-up offer`);
    }
    
    if (reasons.length === 0) {
        reasons.push(`Their ${deal.discountLabel} deal fits your needs`);
    }
    
    return reasons.map(r => `- ${r}`).join('\n');
}

function getVerdict(
    brandA: BrandInfo, 
    brandB: BrandInfo, 
    dealA: any, 
    dealB: any
): string {
    if (!dealA && !dealB) return `Both brands currently have no active student discounts. Check back later for updates.`;
    if (!dealA) return `${brandB.name} currently offers the only active student discount between these brands.`;
    if (!dealB) return `${brandA.name} currently offers the only active student discount between these brands.`;
    
    // Simple comparison logic
    const aScore = (dealA.discountValue || 0) + (dealA.discountType === 'free' ? 50 : 0);
    const bScore = (dealB.discountValue || 0) + (dealB.discountType === 'free' ? 50 : 0);
    
    if (aScore > bScore) {
        return `${brandA.name} offers slightly better value with their ${dealA.discountLabel} deal. However, both brands provide solid student savings, so choose based on your specific needs and preferences.`;
    } else if (bScore > aScore) {
        return `${brandB.name} offers slightly better value with their ${dealB.discountLabel} deal. However, both brands provide solid student savings, so choose based on your specific needs and preferences.`;
    }
    
    return `Both ${brandA.name} and ${brandB.name} offer comparable student discounts. Your choice should come down to brand preference, specific features you need, and which verification method is most convenient for you.`;
}
