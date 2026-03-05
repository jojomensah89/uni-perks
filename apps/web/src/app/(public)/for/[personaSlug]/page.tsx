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
    generatePersonaContent,
    type PersonaInfo,
    type CategoryInfo,
} from "@/lib/pseo/templates";
import {
    generatePersonaSchema,
    generateFaqSchema,
    generatePseoBreadcrumbSchema,
    type DealForSchema,
} from "@/lib/pseo/schema-markup";
import {
    generatePersonaInternalLinks,
} from "@/lib/pseo/internal-links";
import { validatePageGeneration } from "@/lib/pseo/validators";

export const revalidate = 3600; // ISR: revalidate every hour

// Define personas statically for now (could be moved to database)
const PERSONAS: Record<string, PersonaInfo> = {
    'cs-students': {
        name: 'Computer Science Students',
        shortName: 'CS Students',
        slug: 'cs-students',
        description: 'Curated student discounts for computer science, software engineering, and developer students. From coding tools to cloud services.',
        painPoints: [
            'Expensive developer tools and IDE licenses',
            'Cloud hosting costs for projects',
            'Need for productivity software for coding',
            'Access to learning platforms and courses',
        ],
    },
    'design-students': {
        name: 'Design Students',
        shortName: 'Design Students',
        slug: 'design-students',
        description: 'Student discounts for graphic design, UX/UI, and creative arts students. Save on Adobe, design tools, and creative software.',
        painPoints: [
            'Expensive creative software subscriptions',
            'Need for industry-standard design tools',
            'Portfolio hosting costs',
            'Access to design learning resources',
        ],
    },
    'all-students': {
        name: 'All Students',
        shortName: 'Students',
        slug: 'all-students',
        description: 'General student discounts available to all university and college students. Save on entertainment, productivity, lifestyle, and more.',
        painPoints: [
            'Tight budget for entertainment and streaming',
            'Need for productivity tools for coursework',
            'Food and delivery costs',
            'Music streaming subscriptions',
        ],
    },
};

// Map personas to relevant tags
const PERSONA_TAG_MAP: Record<string, string[]> = {
    'cs-students': ['developer-tools', 'productivity', 'cloud-storage'],
    'design-students': ['design-tools', 'productivity'],
    'all-students': ['productivity', 'streaming', 'music', 'cloud-storage'],
};

interface PersonaPageProps {
    params: Promise<{ personaSlug: string }>;
}

export async function generateMetadata({ params }: PersonaPageProps): Promise<Metadata> {
    const { personaSlug } = await params;
    const persona = PERSONAS[personaSlug];

    if (!persona) return { title: "Persona Not Found" };

    return {
        title: `Best Student Discounts for ${persona.name} | UniPerks`,
        description: persona.description,
        alternates: {
            canonical: `https://uni-perks.com/for/${personaSlug}`,
        },
    };
}

export async function generateStaticParams() {
    return Object.keys(PERSONAS).map((slug) => ({
        personaSlug: slug,
    }));
}

export default async function PersonaPage({ params }: PersonaPageProps) {
    const { personaSlug } = await params;
    const persona = PERSONAS[personaSlug];

    if (!persona) {
        notFound();
    }

    // Fetch relevant deals based on persona tags
    let deals: ApiDealResponse[] = [];
    let categories: CategoryInfo[] = [];
    let tags: { slug: string; name: string }[] = [];

    const relevantTagSlugs = PERSONA_TAG_MAP[personaSlug] || [];

    try {
        // Fetch deals by each relevant tag and combine
        const dealPromises = relevantTagSlugs.map((tagSlug) =>
            fetchAPI<{ deals: ApiDealResponse[] }>(`/api/deals?tag=${tagSlug}&limit=50`, { cache: 'force-cache' })
        );

        const [dealsResults, categoriesData, tagsData] = await Promise.all([
            Promise.all(dealPromises),
            fetchAPI<{ categories: CategoryInfo[] }>("/api/categories", { cache: 'force-cache' }),
            fetchAPI<{ tags: { slug: string; name: string }[] }>("/api/tags", { cache: 'force-cache' }),
        ]);

        // Combine and deduplicate deals
        const allDeals = dealsResults.flatMap((r) => r?.deals || []);
        const seenIds = new Set<string>();
        deals = allDeals.filter((d) => {
            if (seenIds.has(d.deal.id)) return false;
            seenIds.add(d.deal.id);
            return true;
        });

        categories = categoriesData?.categories || [];
        tags = tagsData?.tags || [];
    } catch (error) {
        console.error('Error fetching persona data:', error);
    }

    // Validate minimum deals
    const validation = validatePageGeneration({
        deals,
        playbookType: 'persona',
        slug: personaSlug,
    });

    if (!validation.isValid) {
        return (
            <div className="max-w-[1440px] mx-auto bg-background min-h-screen p-8">
                <h1 className="text-3xl font-bold mb-4">
                    Student Discounts for {persona.name}
                </h1>
                <p className="text-muted-foreground">
                    We're currently adding more deals for {persona.shortName.toLowerCase()}. Check back soon!
                </p>
            </div>
        );
    }

    // Generate content
    const content = generatePersonaContent({
        persona,
        deals,
        categories,
    });

    // Generate internal links
    const otherPersonas = Object.values(PERSONAS).filter((p) => p.slug !== personaSlug);
    const internalLinks = generatePersonaInternalLinks({
        currentPersona: persona,
        otherPersonas,
        relevantCategories: categories,
        deals,
    });

    // Generate schema
    const dealsForSchema: DealForSchema[] = deals.map((d) => ({
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

    const personaSchema = generatePersonaSchema({
        deals: dealsForSchema,
        personaName: persona.name,
        personaSlug: persona.slug,
    });

    const faqSchema = generateFaqSchema(content.faqs);

    const breadcrumbSchema = generatePseoBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Student Discounts by Interest", url: "/for" },
        { name: persona.name, url: `/for/${personaSlug}` },
    ]);

    // Get relevant categories for this persona
    const relevantCategories = categories.filter((cat) =>
        deals.some((d) => d.category.slug === cat.slug)
    );

    return (
        <div className="max-w-[1440px] mx-auto bg-background min-h-screen">
            {/* JSON-LD Scripts */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(personaSchema) }}
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
                                <BreadcrumbPage>{persona.shortName}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-black leading-[1.1] tracking-tight mb-4">
                        {content.h1}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        {content.introduction}
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                        {deals.length} curated deals for {persona.shortName.toLowerCase()}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-4 md:p-8">
                <div className="lg:col-span-3 space-y-8">
                    {/* Pain Points */}
                    {persona.painPoints && persona.painPoints.length > 0 && (
                        <section className="bg-card rounded-xl p-6 border border-border">
                            <h2 className="text-xl font-bold mb-4">Common Challenges & Solutions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {persona.painPoints.map((point) => (
                                    <div
                                        key={point}
                                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                                    >
                                        <span className="text-primary mt-1">•</span>
                                        <p className="text-sm text-muted-foreground">{point}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Sections */}
                    {content.sections.map((section) => (
                        <section key={section.heading} className="bg-card rounded-xl p-6 border border-border">
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
                            Curated Deals for {persona.shortName}
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
                        <h3 className="font-bold mb-4">Other Student Groups</h3>
                        <nav className="space-y-2">
                            {otherPersonas.map((p) => (
                                <a
                                    key={p.slug}
                                    href={`/for/${p.slug}`}
                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {p.name}
                                </a>
                            ))}
                        </nav>
                    </div>

                    {/* Relevant Categories */}
                    {relevantCategories.length > 0 && (
                        <div className="bg-card rounded-xl p-6 border border-border">
                            <h3 className="font-bold mb-4">Related Categories</h3>
                            <div className="flex flex-wrap gap-2">
                                {relevantCategories.slice(0, 4).map((cat) => (
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
                    )}

                    {/* Internal Links */}
                    <div className="bg-card rounded-xl p-6 border border-border">
                        <h3 className="font-bold mb-4">Related Pages</h3>
                        <nav className="space-y-2">
                            {internalLinks.slice(0, 5).map((link) => (
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
                </aside>
            </div>
        </div>
    );
}
