import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import type { ApiDealResponse } from "@/components/DealCardLink";
import DealTag from "@/components/DealTag";
import { DealConditionsAccordion } from "@/components/deals/DealConditionsAccordion";
import { ArrowLeft, ExternalLink, Globe, CheckCircle, XCircle, Info, ShieldCheck, DollarSign } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id: slug } = await params;
    try {
        const data = await fetchAPI<{ deal: any, brand: any }>(`/api/deals/${slug}`);
        if (!data || !data.deal) return { title: "Deal Not Found" };
        return {
            title: `${data.brand.name} – ${data.deal.discountLabel}`,
            description: data.deal.shortDescription,
        };
    } catch (error) {
        return { title: "Deal Not Found" };
    }
}

export default async function DealDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: slug } = await params;

    let responseData;
    try {
        responseData = await fetchAPI<{ deal: any, brand: any, category: any, tags: any[], regions: any[] }>(`/api/deals/${slug}`);
    } catch (e) {
        notFound();
    }

    if (!responseData || !responseData.deal) {
        notFound();
    }

    const { deal, brand, category, tags = [], regions = [] } = responseData;

    return (
        <div className="max-w-[1440px] mx-auto bg-background">
            {/* Breadcrumb */}
            <div className="px-4 md:px-6 py-4 border-b border-border">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">
                    <ArrowLeft className="w-4 h-4" />
                    Back to deals
                </Link>
            </div>

            {/* Hero */}
            <div className="relative overflow-hidden rounded-xl mx-4 mt-4 h-[280px] md:h-[360px] bg-muted">
                {/* Gradient overlay using generic fallback */}
                <div className={`absolute inset-0 bg-gradient-to-t bg-primary opacity-60 transition-opacity duration-500`} />
                <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-8 text-primary-foreground">
                    <div className="flex gap-1.5 flex-wrap mb-4">
                        {tags.map((tag: any) => (
                            <DealTag key={tag.id} label={tag.name} variant="light" />
                        ))}
                    </div>
                    <div className="inline-block bg-primary-foreground/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wide mb-4 border border-primary-foreground/30 w-fit">
                        {deal.discountLabel}
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        {brand.logoUrl ? (
                            <img src={brand.logoUrl} className="w-10 h-10 object-contain rounded-md" alt={brand.name} />
                        ) : (
                            <div className="w-10 h-10 bg-white/20 rounded-md flex items-center justify-center font-bold text-xs">{brand.name[0]}</div>
                        )}
                        <h1 className="text-3xl md:text-4xl font-black leading-tight drop-shadow-md">{brand.name}</h1>
                    </div>
                    <p className="text-base opacity-95 max-w-lg mt-2 drop-shadow-sm">{deal.title}</p>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Deal details */}
                    <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
                        <h2 className="text-lg font-bold mb-4">Deal Details</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{deal.longDescription || deal.shortDescription}</p>
                        {deal.estimatedValue && (
                            <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-primary" />
                                <span className="font-medium">Estimated value:</span>
                                <span className="text-muted-foreground">{deal.estimatedValue}</span>
                            </div>
                        )}
                    </section>

                    {/* Regional availability */}
                    {regions && regions.length > 0 && (
                        <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                Regional Availability
                            </h2>
                            <div className="space-y-2">
                                {regions.map((r: any) => (
                                    <div key={r.code} className="flex items-start gap-3 text-sm">
                                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                        <div>
                                            <span className="font-medium">{r.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Terms */}
                    {deal.terms && deal.terms.length > 0 && (
                        <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5" />
                                Terms & Conditions
                            </h2>
                            <ul className="space-y-2">
                                {deal.terms.map((term: string, i: number) => (
                                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                                        <span className="font-bold text-foreground mt-0.5">•</span>
                                        {term}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Redemption guide */}
                    {deal.guidelines && deal.guidelines.length > 0 && (
                        <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
                            <h2 className="text-lg font-bold mb-4">How to Claim</h2>
                            <p className="text-sm text-muted-foreground">Click the "Claim Offer" button from the side panel to proceed.</p>
                        </section>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="bg-card rounded-xl p-6 border border-border shadow-sm lg:sticky lg:top-6">
                        <div className="text-2xl font-black mb-1 text-primary">{deal.discountLabel}</div>
                        <p className="text-sm text-muted-foreground mb-4">{deal.shortDescription}</p>

                        {deal.verificationMethod && (
                            <div className="flex items-center gap-2 text-sm mb-4 p-3 bg-muted rounded-lg">
                                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                                <div>
                                    <p className="font-medium text-xs text-muted-foreground tracking-wide">Verified via</p>
                                    <p className="text-sm font-bold uppercase">{deal.verificationMethod}</p>
                                </div>
                            </div>
                        )}

                        <a
                            href={deal.claimUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-primary text-primary-foreground py-3 rounded-full text-sm font-bold hover:opacity-80 transition-opacity flex items-center justify-center gap-2 no-underline"
                        >
                            Claim Offer
                            <ExternalLink className="w-4 h-4" />
                        </a>

                        <p className="text-xs text-muted-foreground text-center mt-3">
                            You&apos;ll be redirected to {brand.name}&apos;s website
                        </p>

                        {/* @ts-ignore */}
                        {deal.howToRedeem && (
                            <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border/50 text-sm text-muted-foreground leading-relaxed">
                                <span className="block font-semibold text-foreground mb-1">How to redeem</span>
                                {/* @ts-ignore */}
                                {deal.howToRedeem}
                            </div>
                        )}

                        <DealConditionsAccordion
                            conditions={[
                                "Must have a valid tracking identity.",
                                "Offer cannot be combined with other promotions.",
                                brand.termsUrl ? `Subject to ${brand.name} terms of service.` : ""
                            ].filter(Boolean)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
