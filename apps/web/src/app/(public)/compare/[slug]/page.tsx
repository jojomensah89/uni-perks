import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import DealCard, { type ApiDealResponse } from "@/components/DealCard";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import type { Metadata } from "next";
import {
    generateComparisonContent,
    type BrandInfo,
    type CategoryInfo,
} from "@/lib/pseo/templates";
import {
    generateComparisonSchema,
    generateFaqSchema,
    generatePseoBreadcrumbSchema,
    type DealForSchema,
} from "@/lib/pseo/schema-markup";
import {
    generateComparisonInternalLinks,
} from "@/lib/pseo/internal-links";
import {
    validateComparisonPage,
    normalizeComparisonSlug,
} from "@/lib/pseo/validators";
import {
    buildComparisonMatrix,
    generateUseCaseRecommendations,
    generateVerdict,
} from "@/lib/pseo/comparisons";

export const revalidate = 3600; // ISR: revalidate every hour

interface ComparisonPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ComparisonPageProps): Promise<Metadata> {
    const { slug } = await params;

    // Parse slug: "brand-a-vs-brand-b"
    const parts = slug.split('-vs-');
    if (parts.length !== 2) return { title: "Invalid Comparison" };

    const [brandASlug, brandBSlug] = parts;

    try {
        const [brandAData, brandBData] = await Promise.all([
            fetchAPI<{ brand: { name: string; slug: string } }>(`/api/brands/${brandASlug}`, { cache: 'force-cache' }),
            fetchAPI<{ brand: { name: string; slug: string } }>(`/api/brands/${brandBSlug}`, { cache: 'force-cache' }),
        ]);

        const brandA = brandAData?.brand;
        const brandB = brandBData?.brand;

        if (!brandA || !brandB) return { title: "Brand Not Found" };

        return {
            title: `${brandA.name} vs ${brandB.name} Student Discount Comparison | UniPerks`,
            description: `Compare student discounts from ${brandA.name} and ${brandB.name}. Side-by-side comparison of discounts, prices, verification, and more.`,
            alternates: {
                canonical: `https://uni-perks.com/compare/${slug}`,
            },
        };
    } catch {
        return { title: "Comparison Not Found" };
    }
}

export async function generateStaticParams() {
    // This would ideally query all brand pairs in the same category
    // For now, return empty array - pages will be generated on-demand via ISR
    return [];
}

export default async function ComparisonPage({ params }: ComparisonPageProps) {
    const { slug } = await params;

    // Parse slug: "brand-a-vs-brand-b"
    const parts = slug.split('-vs-');
    if (parts.length !== 2) {
        notFound();
    }

    let [brandASlug, brandBSlug] = parts;

    // Ensure alphabetical ordering
    const normalizedSlug = normalizeComparisonSlug(brandASlug, brandBSlug);
    if (normalizedSlug !== slug) {
        // Redirect to normalized URL would happen via Next.js
        // For now, just use the normalized slugs
        const normalizedParts = normalizedSlug.split('-vs-');
        brandASlug = normalizedParts[0];
        brandBSlug = normalizedParts[1];
    }

    // Fetch both brands and their deals
    let brandA: { name: string; slug: string; description?: string } | null = null;
    let brandB: { name: string; slug: string; description?: string } | null = null;
    let brandADeals: ApiDealResponse[] = [];
    let brandBDeals: ApiDealResponse[] = [];
    let categories: CategoryInfo[] = [];
    let hasError = false;

    try {
        const [brandAData, brandBData, categoriesData] = await Promise.all([
            fetchAPI<{ brand: any; deals: ApiDealResponse[] }>(`/api/brands/${brandASlug}`, { cache: 'force-cache' }),
            fetchAPI<{ brand: any; deals: ApiDealResponse[] }>(`/api/brands/${brandBSlug}`, { cache: 'force-cache' }),
            fetchAPI<{ categories: CategoryInfo[] }>("/api/categories", { cache: 'force-cache' }),
        ]);

        brandA = brandAData?.brand;
        brandB = brandBData?.brand;
        brandADeals = brandAData?.deals || [];
        brandBDeals = brandBData?.deals || [];
        categories = categoriesData?.categories || [];
    } catch {
        hasError = true;
    }

    if (hasError || !brandA || !brandB) {
        notFound();
    }

    // Check if both brands have deals in the same category
    const categoryA = brandADeals[0]?.category;
    const categoryB = brandBDeals[0]?.category;
    const sameCategory = categoryA?.slug === categoryB?.slug;

    // Validate
    const validation = validateComparisonPage({
        brandADeals,
        brandBDeals,
        brandASlug,
        brandBSlug,
        sameCategory,
    });

    if (!validation.isValid) {
        return (
            <div className="max-w-[1440px] mx-auto bg-background min-h-screen p-8">
                <h1 className="text-3xl font-bold mb-4">
                    {brandA.name} vs {brandB.name} Student Discount
                </h1>
                <p className="text-muted-foreground mb-4">
                    {validation.reason || "This comparison is not available."}
                </p>
                <div className="space-x-4">
                    <a href={`/brands/${brandASlug}`} className="text-primary hover:underline">
                        View {brandA.name} deals
                    </a>
                    <a href={`/brands/${brandBSlug}`} className="text-primary hover:underline">
                        View {brandB.name} deals
                    </a>
                </div>
            </div>
        );
    }

    const category = categoryA || categoryB;
    const dealA = brandADeals[0];
    const dealB = brandBDeals[0];

    // Generate content
    const content = generateComparisonContent({
        brandA: { name: brandA.name, slug: brandA.slug },
        brandB: { name: brandB.name, slug: brandB.slug },
        brandADeals,
        brandBDeals,
        category: category!,
    });

    // Build comparison matrix
    const matrix = buildComparisonMatrix({
        brandA: { name: brandA.name, slug: brandA.slug },
        brandB: { name: brandB.name, slug: brandB.slug },
        dealA: dealA.deal,
        dealB: dealB.deal,
    });

    // Generate use case recommendations
    const recommendations = generateUseCaseRecommendations({
        brandAName: brandA.name,
        brandBName: brandB.name,
        matrix,
    });

    // Generate verdict
    const verdict = generateVerdict({
        brandAName: brandA.name,
        brandBName: brandB.name,
        matrix,
    });

    // Generate internal links
    const internalLinks = generateComparisonInternalLinks({
        brandA: { name: brandA.name, slug: brandA.slug },
        brandB: { name: brandB.name, slug: brandB.slug },
        category: category!,
        otherBrands: [], // Would need to fetch other brands in same category
        existingComparisons: [],
    });

    // Generate schema
    const dealsForSchemaA: DealForSchema | undefined = dealA ? {
        slug: dealA.deal.slug,
        title: dealA.deal.title,
        shortDescription: dealA.deal.shortDescription,
        discountLabel: dealA.deal.discountLabel,
        studentPrice: dealA.deal.studentPrice,
        originalPrice: dealA.deal.originalPrice,
        currency: dealA.deal.currency,
        brand: dealA.brand,
        category: dealA.category,
    } : undefined;

    const dealsForSchemaB: DealForSchema | undefined = dealB ? {
        slug: dealB.deal.slug,
        title: dealB.deal.title,
        shortDescription: dealB.deal.shortDescription,
        discountLabel: dealB.deal.discountLabel,
        studentPrice: dealB.deal.studentPrice,
        originalPrice: dealB.deal.originalPrice,
        currency: dealB.deal.currency,
        brand: dealB.brand,
        category: dealB.category,
    } : undefined;

    const comparisonSchema = generateComparisonSchema({
        brandA: { name: brandA.name, slug: brandA.slug },
        brandB: { name: brandB.name, slug: brandB.slug },
        dealA: dealsForSchemaA,
        dealB: dealsForSchemaB,
        category: category!,
    });

    const faqSchema = generateFaqSchema(content.faqs);

    const breadcrumbSchema = generatePseoBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Compare Student Discounts", url: "/compare" },
        { name: `${brandA.name} vs ${brandB.name}`, url: `/compare/${slug}` },
    ]);

    return (
        <div className="max-w-[1440px] mx-auto bg-background min-h-screen">
            {/* JSON-LD Scripts */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            {/* Hero */}
            <div className="bg-muted px-4 md:px-8 py-12 md:py-16 border-b border-border">
                <div className="max-w-4xl">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink render={<Link href={`/student-discounts/${category?.slug ?? ''}` as any} />}>{category?.name}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{brandA.name} vs {brandB.name}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-black leading-[1.1] tracking-tight mb-4">
                        {content.h1}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        {content.introduction}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-4 md:p-8">
                <div className="lg:col-span-3 space-y-8">
                    {/* Comparison Matrix */}
                    <section className="bg-card rounded-xl p-6 border border-border">
                        <h2 className="text-xl font-bold mb-6">Side-by-Side Comparison</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feature</th>
                                        <th className="text-left py-3 px-4 font-semibold">
                                            <a href={`/brands/${brandA.slug}`} className="hover:text-primary">{brandA.name}</a>
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold">
                                            <a href={`/brands/${brandB.slug}`} className="hover:text-primary">{brandB.name}</a>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matrix.features.map((feature) => (
                                        <tr key={feature.name} className="border-b border-border last:border-0">
                                            <td className="py-3 px-4 text-muted-foreground">{feature.name}</td>
                                            <td className={`py-3 px-4 ${feature.winner === 'brandA' ? 'text-primary font-medium' : ''}`}>
                                                {feature.brandAValue}
                                                {feature.winner === 'brandA' && <span className="ml-2 text-xs">✓</span>}
                                            </td>
                                            <td className={`py-3 px-4 ${feature.winner === 'brandB' ? 'text-primary font-medium' : ''}`}>
                                                {feature.brandBValue}
                                                {feature.winner === 'brandB' && <span className="ml-2 text-xs">✓</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Use Case Recommendations */}
                    {recommendations.map((rec) => (
                        <section key={rec.brand} className="bg-card rounded-xl p-6 border border-border">
                            <h2 className="text-xl font-bold mb-4">
                                Choose {rec.brand === 'A' ? brandA.name : brandB.name} if...
                            </h2>
                            <ul className="space-y-2">
                                {rec.scenarios.map((scenario) => (
                                    <li key={scenario} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <span className="text-primary mt-1">•</span>
                                        {scenario}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}

                    {/* Verdict */}
                    <section className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                        <h2 className="text-xl font-bold mb-4">Our Verdict</h2>
                        <p className="text-foreground leading-relaxed">{verdict}</p>
                    </section>

                    {/* Deal Cards */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-visible">
                        <div>
                            <h3 className="font-bold mb-4">{brandA.name} Deal</h3>
                            {dealA && <DealCard dealData={dealA} />}
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">{brandB.name} Deal</h3>
                            {dealB && <DealCard dealData={dealB} />}
                        </div>
                    </section>

                    {/* FAQs */}
                    <section className="bg-card rounded-xl p-6 border border-border relative z-10">
                        <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
                        <Accordion multiple className="w-full">
                            {content.faqs.map((faq, i) => (
                                <AccordionItem key={faq.question} value={`faq-${i}`}>
                                    <AccordionTrigger className="text-left font-semibold">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                    <div className="bg-card rounded-xl p-6 border border-border sticky top-[5.5rem]">
                        <h3 className="font-bold mb-4">Related Comparisons</h3>
                        <nav className="space-y-2">
                            {internalLinks.map((link) => (
                                <a
                                    key={link.url}
                                    href={link.url}
                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                    </div>

                    <div className="bg-card rounded-xl p-6 border border-border">
                        <h3 className="font-bold mb-4">More {category?.name} Deals</h3>
                        <a
                            href={`/student-discounts/${category?.slug}`}
                            className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            View all {category?.name} student discounts
                        </a>
                    </div>
                </aside>
            </div>
        </div>
    );
}
