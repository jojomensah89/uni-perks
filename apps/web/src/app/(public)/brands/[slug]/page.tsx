import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import DealCard, { type ApiDealResponse } from "@/components/DealCard";
import { ShieldCheck, ExternalLink, Globe } from "lucide-react";
import type { Metadata } from "next";

interface BrandPageProps {
    params: Promise<{ slug: string }>;
}

interface ApiBrandDetail {
    id: string;
    name: string;
    slug: string;
    tagline?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    coverImageUrl?: string | null;
    website?: string | null;
    whyWeLoveIt?: string | null;
    isVerified?: boolean | null;
    totalClickCount?: number | null;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const data = await fetchAPI<{ brand: ApiBrandDetail }>(`/api/brands/${slug}`);
        if (!data || !data.brand) return { title: "Brand Not Found" };
        return {
            title: `${data.brand.name} Student Discounts`,
            description: data.brand.tagline || data.brand.description || `Student discounts for ${data.brand.name}`,
        };
    } catch {
        return { title: "Brand Not Found" };
    }
}

export default async function BrandPage({ params }: BrandPageProps) {
    const { slug } = await params;

    let brandData: { brand: ApiBrandDetail; deals: ApiDealResponse[] } | null = null;

    try {
        brandData = await fetchAPI<{ brand: ApiBrandDetail; deals: ApiDealResponse[] }>(`/api/brands/${slug}`);
    } catch {
        notFound();
    }

    if (!brandData || !brandData.brand) {
        notFound();
    }

    const { brand, deals } = brandData;

    return (
        <div className="max-w-[1440px] mx-auto bg-background min-h-screen">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-xl mx-4 mt-4 h-[240px] md:h-[320px] bg-muted">
                {brand.coverImageUrl ? (
                    <img
                        src={brand.coverImageUrl}
                        alt={brand.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="flex items-center gap-4">
                        {brand.logoUrl ? (
                            <img
                                src={brand.logoUrl}
                                alt={brand.name}
                                className="w-14 h-14 object-contain rounded-lg bg-white p-2"
                            />
                        ) : (
                            <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center font-bold text-xl">
                                {brand.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">{brand.name}</h1>
                            {brand.tagline && (
                                <p className="text-sm text-white/80">{brand.tagline}</p>
                            )}
                        </div>
                        {brand.isVerified && (
                            <div className="ml-auto">
                                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Verified
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* About */}
                    {(brand.description || brand.whyWeLoveIt) && (
                        <section className="bg-card rounded-xl p-6 border border-border">
                            <h2 className="text-lg font-bold mb-4">About {brand.name}</h2>
                            {brand.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                    {brand.description}
                                </p>
                            )}
                            {brand.whyWeLoveIt && (
                                <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Why we love it</p>
                                    <p className="text-sm text-foreground">{brand.whyWeLoveIt}</p>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Deals Grid */}
                    <section>
                        <h2 className="text-lg font-bold mb-4">
                            {deals.length} Student Discount{deals.length !== 1 ? "s" : ""} Available
                        </h2>
                        {deals.length === 0 ? (
                            <div className="py-12 text-center border-2 border-dashed rounded-xl">
                                <p className="text-muted-foreground">No active deals for this brand.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {deals.map((dealWrapper) => (
                                    <DealCard
                                        key={dealWrapper.deal.id}
                                        dealData={dealWrapper}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="bg-card rounded-xl p-6 border border-border lg:sticky lg:top-6">
                        <h3 className="font-semibold mb-4">Visit Website</h3>
                        {brand.website && (
                            <a
                                href={brand.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-primary text-primary-foreground py-3 rounded-full text-sm font-bold hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
                            >
                                <Globe className="w-4 h-4" />
                                Visit {brand.name}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                        {brand.totalClickCount !== null && brand.totalClickCount !== undefined && (
                            <p className="text-xs text-muted-foreground text-center mt-3">
                                {brand.totalClickCount.toLocaleString()} students have claimed deals from {brand.name}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
