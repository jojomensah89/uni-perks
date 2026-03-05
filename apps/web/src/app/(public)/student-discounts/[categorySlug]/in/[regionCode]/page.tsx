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
    generateLocationContent,
    type RegionInfo,
    type CategoryInfo,
} from "@/lib/pseo/templates";
import {
    generateLocationSchema,
    generateFaqSchema,
    generatePseoBreadcrumbSchema,
    type DealForSchema,
} from "@/lib/pseo/schema-markup";
import {
    generateLocationInternalLinks,
} from "@/lib/pseo/internal-links";
import { validatePageGeneration } from "@/lib/pseo/validators";

export const revalidate = 3600; // ISR: revalidate every hour

interface CategoryLocationPageProps {
    params: Promise<{ categorySlug: string; regionCode: string }>;
}

export async function generateMetadata({ params }: CategoryLocationPageProps): Promise<Metadata> {
    const { categorySlug, regionCode } = await params;
    const upperRegionCode = regionCode.toUpperCase();

    try {
        const [catData, regionsData] = await Promise.all([
            fetchAPI<{ category: { name: string; slug: string } }>(
                `/api/categories/${categorySlug}`,
                { cache: 'force-cache' }
            ),
            fetchAPI<{ regions: RegionInfo[] }>("/api/geo/regions", { cache: 'force-cache' }),
        ]);

        const category = catData?.category;
        const region = regionsData?.regions?.find(r => r.code === upperRegionCode);

        if (!category || !region) return { title: "Page Not Found" };

        return {
            title: `${category.name} Student Discounts in ${region.name} | UniPerks`,
            description: `Find ${category.name.toLowerCase()} student discounts available in ${region.name}. Verified deals updated regularly.`,
            alternates: {
                canonical: `https://uni-perks.com/student-discounts/${categorySlug}/in/${regionCode}`,
            },
        };
    } catch {
        return { title: "Page Not Found" };
    }
}

export async function generateStaticParams() {
    try {
        const [categoriesData, regionsData] = await Promise.all([
            fetchAPI<{ categories: CategoryInfo[] }>("/api/categories", { cache: 'force-cache' }),
            fetchAPI<{ regions: RegionInfo[] }>("/api/geo/regions", { cache: 'force-cache' }),
        ]);

        const params: Array<{ categorySlug: string; regionCode: string }> = [];
        
        for (const cat of categoriesData?.categories || []) {
            for (const region of regionsData?.regions || []) {
                params.push({
                    categorySlug: cat.slug,
                    regionCode: region.code.toLowerCase(),
                });
            }
        }

        return params;
    } catch {
        return [];
    }
}

export default async function CategoryLocationPage({ params }: CategoryLocationPageProps) {
    const { categorySlug, regionCode } = await params;
    const upperRegionCode = regionCode.toUpperCase();

    // Fetch data
    let category: CategoryInfo | undefined;
    let region: RegionInfo | undefined;
    let deals: ApiDealResponse[] = [];
    let categories: CategoryInfo[] = [];

    try {
        const [catData, regionsData, dealsData, categoriesData] = await Promise.all([
            fetchAPI<{ category: CategoryInfo }>(`/api/categories/${categorySlug}`, { cache: 'force-cache' }),
            fetchAPI<{ regions: RegionInfo[] }>("/api/geo/regions", { cache: 'force-cache' }),
            fetchAPI<{ deals: ApiDealResponse[] }>(`/api/deals?category=${categorySlug}&region=${upperRegionCode}&limit=100`, { cache: 'force-cache' }),
            fetchAPI<{ categories: CategoryInfo[] }>("/api/categories", { cache: 'force-cache' }),
        ]);

        category = catData?.category;
        region = regionsData?.regions?.find(r => r.code === upperRegionCode);
        deals = dealsData?.deals || [];
        categories = categoriesData?.categories || [];
    } catch {
        notFound();
    }

    if (!category || !region) {
        notFound();
    }

    // Validate minimum deals
    const validation = validatePageGeneration({
        deals,
        playbookType: 'location',
        slug: `${categorySlug}-${regionCode}`,
    });

    if (!validation.isValid) {
        return (
            <div className="max-w-[1440px] mx-auto bg-background min-h-screen p-8">
                <h1 className="text-3xl font-bold mb-4">
                    {category.name} Student Discounts in {region.name}
                </h1>
                <p className="text-muted-foreground">
                    We're currently adding more deals for this combination. Check back soon!
                </p>
                <div className="mt-6 space-x-4">
                    <a
                        href={`/student-discounts/${categorySlug}`}
                        className="text-primary hover:underline"
                    >
                        View all {category.name} deals
                    </a>
                    <a
                        href={`/student-discounts/in/${regionCode}`}
                        className="text-primary hover:underline"
                    >
                        View all deals in {region.name}
                    </a>
                </div>
            </div>
        );
    }

    // Generate content
    const content = generateLocationContent({
        region,
        deals,
        categories,
    });

    // Override H1 for category+region combo
    const h1 = `${category.name} Student Discounts in ${region.name}`;
    const intro = `Find ${deals.length} verified ${category.name.toLowerCase()} student discounts available in ${region.name}. These deals are specifically available to students in ${region.name} or have no regional restrictions.`;

    // Generate internal links
    const internalLinks = generateLocationInternalLinks({
        currentRegion: region,
        allRegions: [],
        categories,
        deals,
        categorySlug,
    });

    // Generate schema
    const dealsForSchema: DealForSchema[] = deals.map(d => ({
        slug: d.deal.slug,
        title: d.deal.title,
        shortDescription: d.deal.shortDescription,
        discountLabel: d.deal.discountLabel,
        studentPrice: d.deal.studentPrice,
        originalPrice: d.deal.originalPrice,
        currency: d.deal.currency,
        brand: d.brand,
        category: d.category,
    }));

    const itemSchema = generateLocationSchema({
        deals: dealsForSchema,
        region,
    });

    const faqSchema = generateFaqSchema(content.faqs);

    const breadcrumbSchema = generatePseoBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Student Discounts", url: "/student-discounts" },
        { name: category.name, url: `/student-discounts/${categorySlug}` },
        { name: region.name, url: `/student-discounts/${categorySlug}/in/${regionCode}` },
    ]);

    return (
        <div className="max-w-[1440px] mx-auto bg-background min-h-screen">
            {/* JSON-LD Scripts */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemSchema) }}
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
                                <BreadcrumbLink render={<Link href={`/student-discounts/${categorySlug}` as any} />}>{category.name}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{region.name}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-black leading-[1.1] tracking-tight mb-4">
                        {h1}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        {intro}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-4 md:p-8">
                <div className="lg:col-span-3 space-y-8">
                    {/* Deals Grid */}
                    <section>
                        <h2 className="text-xl font-bold mb-6">
                            {deals.length} {category.name} Deals in {region.name}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {deals.map((dealWrapper) => (
                                <DealCard key={dealWrapper.deal.id} dealData={dealWrapper} />
                            ))}
                        </div>
                    </section>

                    {/* FAQs */}
                    <section className="bg-card rounded-xl p-6 border border-border">
                        <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
                        <Accordion multiple className="w-full">
                            {content.faqs.map((faq, i) => (
                                <AccordionItem key={i} value={`faq-${i}`}>
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
                        <h3 className="font-bold mb-4">Related Links</h3>
                        <nav className="space-y-2">
                            <a
                                href={`/student-discounts/${categorySlug}`}
                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                All {category.name} Deals
                            </a>
                            <a
                                href={`/student-discounts/in/${regionCode}`}
                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                All Deals in {region.name}
                            </a>
                            {internalLinks.slice(0, 4).map((link, i) => (
                                <a
                                    key={i}
                                    href={link.url}
                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                    </div>
                </aside>
            </div>
        </div>
    );
}
