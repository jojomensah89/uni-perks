import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, ShieldCheck, Clock, Share2 } from 'lucide-react';
import { generateDealStructuredData } from '@/lib/structured-data';

export const runtime = 'edge';

interface DealDetail {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    longDescription: string;
    discountLabel: string;
    claimUrl: string;
    brand: {
        name: string;
        slug: string;
        logoUrl?: string;
        website?: string;
    };
    category?: {
        name: string;
        slug: string;
    };
    tags?: { id: string; name: string }[];
    coverImageUrl?: string;
    expiryDate?: string; // Mapped from expirationDate
    expirationDate?: string;
    terms?: string;
    studentPrice?: number;
    originalPrice?: number;
    currency?: string;
    createdAt: string;
}

interface DealResponse {
    deal: DealDetail;
}

// Generate Metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    try {
        const { deal } = await fetchAPI<DealResponse>(`api/deals/${params.slug}`);

        if (!deal) return {};

        return {
            title: `${deal.title} | ${deal.brand.name} Student Discount`,
            description: deal.shortDescription,
            openGraph: {
                title: deal.title,
                description: deal.shortDescription,
                images: deal.coverImageUrl ? [{ url: deal.coverImageUrl }] : undefined,
                type: 'website',
            },
        };
    } catch (error) {
        return {
            title: 'Deal Not Found',
        };
    }
}

export default async function DealPage({ params }: { params: { slug: string } }) {
    let deal: DealDetail;

    try {
        const response = await fetchAPI<DealResponse>(`api/deals/${params.slug}`);
        deal = response.deal;
    } catch (error) {
        notFound();
    }

    const structuredData = generateDealStructuredData(deal);

    return (
        <div className="min-h-screen bg-background pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Back Navigation */}
            <div className="container mx-auto px-4 py-6">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to deals
                </Link>
            </div>

            <main className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                    {/* Left Column: Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Header Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                {deal.brand.logoUrl && (
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border bg-white shadow-sm">
                                        <Image
                                            src={deal.brand.logoUrl}
                                            alt={`${deal.brand.name} logo`}
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{deal.title}</h1>
                                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                                        <span className="font-medium text-foreground">{deal.brand.name}</span>
                                        <span>•</span>
                                        <span>{deal.category?.name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cover Image */}
                            {deal.coverImageUrl && (
                                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border shadow-sm">
                                    <Image
                                        src={deal.coverImageUrl}
                                        alt={deal.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            )}

                            {/* Description */}
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <h3 className="text-xl font-semibold mb-4">About this deal</h3>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {deal.longDescription || deal.shortDescription}
                                </p>
                            </div>

                            {/* Terms & Conditions */}
                            {deal.terms && (
                                <div className="bg-muted/50 rounded-lg p-6 border">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4" />
                                        Terms & Conditions
                                    </h4>
                                    <p className="text-sm text-muted-foreground">{deal.terms}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Action Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-sm space-y-6">
                            <div className="text-center space-y-2">
                                <div className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide">
                                    {deal.discountLabel}
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    Verified & Active
                                </p>
                            </div>

                            <a
                                href={deal.claimUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(buttonVariants({ size: "lg" }), "w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 cursor-pointer")}
                            >
                                Get Deal
                                <ExternalLink className="ml-2 h-5 w-5" />
                            </a>

                            <div className="pt-6 border-t space-y-4">
                                <h4 className="font-medium text-sm">Highlights</h4>
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5" />
                                        <span>Official student discount from {deal.brand.name}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5" />
                                        <span>Instant access, no waiting period</span>
                                    </li>
                                    {deal.expiryDate && (
                                        <li className="flex items-start gap-2">
                                            <Clock className="h-4 w-4 text-orange-500 mt-0.5" />
                                            <span>Valid until {new Date(deal.expiryDate).toLocaleDateString()}</span>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <Button variant="outline" className="w-full gap-2" >
                                <Share2 className="h-4 w-4" />
                                Share this deal
                            </Button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
