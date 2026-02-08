import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink, Globe, MapPin, CheckCircle, XCircle } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import type { Perk, Category } from "@/types";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ClaimButton } from "@/components/ClaimButton";

export const runtime = "edge";

interface PerkPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ country?: string }>;
}

interface PerkDetailResponse {
    perk: Perk;
    category: Category;
    meta: {
        country: string;
        available: boolean;
    };
}

export async function generateMetadata({ params }: PerkPageProps): Promise<Metadata> {
    const { slug } = await params;

    let data: PerkDetailResponse | null = null;
    try {
        data = await fetchAPI<PerkDetailResponse>(`api/perks/${slug}`, { cache: 'force-cache' });
    } catch (e) {
        return {
            title: "Perk Not Found",
            description: "The requested perk could not be found.",
        };
    }

    if (!data || !data.perk) {
        return {
            title: "Perk Not Found",
            description: "The requested perk could not be found.",
        };
    }

    const { perk, category } = data;
    const title = `${perk.title} - ${perk.company}`;
    const description = perk.shortDescription || `Get exclusive student discounts on ${perk.company}. ${perk.longDescription?.substring(0, 100)}...`;

    return {
        title,
        description,
        keywords: [perk.company, perk.title, category?.name || '', 'student discount', 'student perk'],
        openGraph: {
            title,
            description,
            type: "website",
            url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://uni-perks.com'}/perks/${slug}`,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}



export default async function PerkPage({ params, searchParams }: PerkPageProps) {
    const { slug } = await params;
    const { country } = await searchParams;

    const queryString = country ? `?country=${country}` : '';

    let data: PerkDetailResponse | null = null;

    try {
        data = await fetchAPI<PerkDetailResponse>(`api/perks/${slug}${queryString}`);
    } catch (e) {
        console.error("Failed to fetch perk", e);
        // If 404, we should show not found
    }

    if (!data || !data.perk) {
        notFound();
    }

    const { perk, category, meta } = data;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link
                href={"/perks" as any}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to perks
            </Link>

            <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
                <main className="space-y-8">
                    {/* Header */}
                    <div className="flex items-start gap-6">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border bg-muted">
                            {perk.companyLogo ? (
                                <Image
                                    src={perk.companyLogo}
                                    alt={perk.company}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-3xl font-bold text-gray-400">
                                    {perk.company.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            {category && (
                                <span className="inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground mb-2">
                                    {category.name}
                                </span>
                            )}
                            <h1 className="text-3xl font-bold tracking-tight">{perk.title}</h1>
                            <p className="text-xl text-muted-foreground">{perk.company}</p>
                        </div>
                    </div>

                    {/* Availability Alert */}
                    <div className={cn(
                        "rounded-lg border p-4 flex items-start gap-4",
                        meta.available ? "bg-green-50/50 border-green-200" : "bg-red-50/50 border-red-200"
                    )}>
                        {meta.available ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        )}
                        <div>
                            <h3 className={cn("font-semibold", meta.available ? "text-green-900" : "text-red-900")}>
                                {meta.available ? "Available in your region" : "Not available in your region"}
                            </h3>
                            <p className={cn("text-sm mt-1", meta.available ? "text-green-700" : "text-red-700")}>
                                {meta.available
                                    ? `This perk is valid for students in ${meta.country}.`
                                    : `This perk is not available in ${meta.country}.`
                                }
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                        <h2 className="text-xl font-semibold mb-4">Description</h2>
                        <p className="whitespace-pre-wrap">{perk.longDescription || perk.shortDescription}</p>

                        {perk.eligibilityNote && (
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Eligibility Requirements</h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300">{perk.eligibilityNote}</p>
                            </div>
                        )}

                        {perk.regionNotes && (
                            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">Regional Information</h3>
                                <p className="text-sm text-amber-700 dark:text-amber-300">{perk.regionNotes}</p>
                            </div>
                        )}
                    </div>

                    {/* How to Claim */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">How to Claim</h2>
                        <div className="bg-muted/50 p-6 rounded-lg border space-y-4">
                            <div className="flex gap-4">
                                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">1</div>
                                <div>
                                    <h3 className="font-medium">Verification Method</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {perk.verificationMethod === 'email' && 'Requires a valid .edu email address.'}
                                        {perk.verificationMethod === 'unidays' && 'Requires UNiDAYS account.'}
                                        {perk.verificationMethod === 'shierid' && 'Requires SheerID verification.'}
                                        {perk.verificationMethod === 'manual' && 'Manual document upload required.'}
                                        {perk.verificationMethod === 'none' && 'No specific verification listed, likely open to all.'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">2</div>
                                <div>
                                    <h3 className="font-medium">Go to Offer</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Click the button below to visit the official offer page.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Sidebar / CTA */}
                <aside className="space-y-6">
                    <div className="sticky top-24 rounded-xl border bg-card p-6 shadow-sm space-y-6">
                        {perk.valueAmount && (
                            <div className="text-center pb-6 border-b">
                                <p className="text-sm text-muted-foreground mb-1">Estimated Value</p>
                                <div className="text-4xl font-bold text-green-600">
                                    {perk.valueCurrency === 'USD' && '$'}{perk.valueAmount}
                                </div>
                            </div>
                        )}

                        <ClaimButton
                            perkId={perk.id}
                            claimUrl={perk.claimUrl}
                            available={meta.available}
                        />

                        {!meta.available && (
                            <p className="text-xs text-center text-muted-foreground">
                                Link might redirect to global homepage
                            </p>
                        )}

                        <div className="space-y-3 pt-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Globe className="w-4 h-4" />
                                <span>{perk.isGlobal ? 'Global Availability' : `${perk.availableCountries?.length || 0} Countries`}</span>
                            </div>
                            {perk.region && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span>{perk.region} Region</span>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
