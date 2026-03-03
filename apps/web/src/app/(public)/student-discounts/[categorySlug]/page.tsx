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
    generateCurationContent,
    type CategoryInfo,
} from "@/lib/pseo/templates";
import {
    generateCurationSchema,
    generateFaqSchema,
    generatePseoBreadcrumbSchema,
    type DealForSchema,
} from "@/lib/pseo/schema-markup";
import {
    generateCurationInternalLinks,
    type InternalLink,
} from "@/lib/pseo/internal-links";
import { validatePageGeneration } from "@/lib/pseo/validators";

export const revalidate = 3600; // ISR: revalidate every hour

interface CategoryPageProps {
    params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { categorySlug } = await params;
    try {
        const data = await fetchAPI<{ category: { name: string; slug: string } }>(
            `/api/categories/${categorySlug}`,
            { cache: 'force-cache' }
        );
        if (!data?.category) return { title: "Category Not Found" };

        const { category } = data;
        return {
            title: `Best ${category.name} Student Discounts | UniPerks`,
            description: `Discover the top student discounts on ${category.name.toLowerCase()} products and services. Verified deals updated regularly.`,
            alternates: {
                canonical: `https://uni-perks.com/student-discounts/${categorySlug}`,
            },
        };
    } catch {
        return { title: "Category Not Found" };
    }
}

export async function generateStaticParams() {
    try {
        const data = await fetchAPI<{ categories: Array<{ slug: string }> }>(
            "/api/categories",
            { cache: 'force-cache' }
        );
        return (data?.categories || []).map((cat) => ({
            categorySlug: cat.slug,
        }));
    } catch {
        return [];
    }
}

export default async function CategoryCurationPage({ params }: CategoryPageProps) {
    const { categorySlug } = await params;

    // Fetch category and its deals
    let categoryData: {
        category: { id: string; name: string; slug: string };
        deals: ApiDealResponse[];
    } | null = null;

    let allCategories: CategoryInfo[] = [];
    let regions: { code: string; name: string }[] = [];

    try {
        const [catData, categoriesData, regionsData] = await Promise.all([
            fetchAPI<{ category: any; deals: ApiDealResponse[] }>(
                `/api/categories/${categorySlug}`,
                { cache: 'force-cache' }
            ),
            fetchAPI<{ categories: CategoryInfo[] }>("/api/categories", { cache: 'force-cache' }),
            fetchAPI<{ regions: { code: string; name: string }[] }>("/api/geo/regions", { cache: 'force-cache' }),
        ]);
        categoryData = catData;
        allCategories = categoriesData?.categories || [];
        regions = regionsData?.regions || [];
    } catch {
        notFound();
    }

    if (!categoryData?.category || !categoryData.deals?.length) {
        notFound();
    }

    const { category, deals } = categoryData;

    // Validate minimum deals
    const validation = validatePageGeneration({
        deals,
        playbookType: 'curation',
        slug: categorySlug,
    });

    if (!validation.isValid) {
        // Not enough deals - render minimal page
        return (
            <div className="max-w-[1440px] mx-auto bg-background min-h-screen p-8">
                <h1 className="text-3xl font-bold mb-4">{category.name} Student Discounts</h1>
                <p className="text-muted-foreground">
                    We're currently adding more deals to this category. Check back soon!
                </p>
            </div>
        );
    }

    // Generate content
    const content = generateCurationContent({
        category: { name: category.name, slug: category.slug },
        deals,
        relatedCategories: allCategories.filter(c => c.slug !== categorySlug).slice(0, 4),
    });

    // Generate internal links
    const internalLinks = generateCurationInternalLinks({
        currentCategory: { name: category.name, slug: category.slug },
        allCategories,
        regions,
        deals,
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

    const itemSchema = generateCurationSchema({
        deals: dealsForSchema,
        categoryName: category.name,
        categorySlug: category.slug,
    });

    const faqSchema = generateFaqSchema(content.faqs);

    const breadcrumbSchema = generatePseoBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Student Discounts", url: "/student-discounts" },
        { name: category.name, url: `/student-discounts/${category.slug}` },
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
                                <BreadcrumbLink render={<Link href="/browse" />}>Student Discounts</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{category.name}</BreadcrumbPage>
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
                    {/* Sections */}
                    {content.sections.map((section, i) => (
                        <section key={i} className="bg-card rounded-xl p-6 border border-border">
                            <h2 className="text-xl font-bold mb-4">{section.heading}</h2>
                            <div className="prose prose-sm max-w-none text-muted-foreground">
                                {section.body.split('\n').map((line, j) => (
                                    <p key={j}>{line}</p>
                                ))}
                            </div>
                        </section>
                    ))}

                    {/* Deals Grid */}
                    <section>
                        <h2 className="text-xl font-bold mb-6">
                            {deals.length} Active {category.name} Deals
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
                        <h3 className="font-bold mb-4">Related Pages</h3>
                        <nav className="space-y-2">
                            {internalLinks.map((link, i) => (
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

                    {/* Related Categories */}
                    <div className="bg-card rounded-xl p-6 border border-border">
                        <h3 className="font-bold mb-4">Other Categories</h3>
                        <div className="flex flex-wrap gap-2">
                            {allCategories
                                .filter(c => c.slug !== categorySlug)
                                .slice(0, 4)
                                .map((cat) => (
                                    <a
                                        key={cat.slug}
                                        href={`/student-discounts/${cat.slug}`}
                                        className="px-3 py-1.5 bg-muted rounded-full text-sm hover:bg-primary/10 transition-colors"
                                    >
                                        {cat.name}
                                    </a>
                                ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
