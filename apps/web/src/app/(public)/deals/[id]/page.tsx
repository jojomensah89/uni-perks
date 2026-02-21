import Link from "next/link";
import { notFound } from "next/navigation";
import { getDealById, getSimilarDeals, allDeals } from "@/data/deals";
import DealCardLink from "@/components/DealCardLink";
import DealTag from "@/components/DealTag";
import { DealConditionsAccordion } from "@/components/deals/DealConditionsAccordion";
import { ArrowLeft, ExternalLink, Globe, CheckCircle, XCircle, Info, ShieldCheck, DollarSign } from "lucide-react";

export async function generateStaticParams() {
    return allDeals.map((deal) => ({ id: deal.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const deal = getDealById(id);
    if (!deal) return { title: "Deal Not Found" };
    return {
        title: `${deal.brand} – ${deal.discount}`,
        description: deal.detail,
    };
}

export default async function DealDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const deal = getDealById(id);

    if (!deal) {
        notFound();
    }

    const similar = getSimilarDeals(deal);

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
            <div className="relative overflow-hidden rounded-xl mx-4 mt-4 h-[280px] md:h-[360px]">
                <img src={deal.image} alt={deal.brand} className="absolute inset-0 w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${deal.bg} opacity-80`} />
                <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-8 text-primary-foreground">
                    <div className="flex gap-1.5 flex-wrap mb-4">
                        {deal.tags.map((tag) => (
                            <DealTag key={tag} label={tag} variant="light" />
                        ))}
                    </div>
                    <div className="inline-block bg-primary-foreground/20 backdrop-blur-sm rounded-pill px-4 py-1.5 text-sm font-bold uppercase tracking-wide mb-4 border border-primary-foreground/30 w-fit">
                        {deal.discount}
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <svg viewBox="0 0 24 24" className="w-10 h-10 fill-primary-foreground" xmlns="http://www.w3.org/2000/svg">
                            <path d={deal.logoSvg} />
                        </svg>
                        <h1 className="text-3xl md:text-4xl font-black leading-tight">{deal.brand}</h1>
                    </div>
                    <p className="text-base opacity-90 max-w-lg">{deal.subtitle}</p>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
                {/* Main column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Deal details */}
                    <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
                        <h2 className="text-lg font-bold mb-4">Deal Details</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{deal.detail}</p>
                        {deal.estimatedValue && (
                            <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-[hsl(141,73%,42%)]" />
                                <span className="font-medium">Estimated value:</span>
                                <span className="text-muted-foreground">{deal.estimatedValue}</span>
                            </div>
                        )}
                    </section>

                    {/* Regional availability */}
                    {deal.regions && deal.regions.length > 0 && (
                        <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                Regional Availability
                            </h2>
                            <div className="space-y-2">
                                {deal.regions.map((r) => (
                                    <div key={r.region} className="flex items-start gap-3 text-sm">
                                        {r.available ? (
                                            <CheckCircle className="w-4 h-4 text-[hsl(141,73%,42%)] mt-0.5 shrink-0" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                                        )}
                                        <div>
                                            <span className="font-medium">{r.region}</span>
                                            {r.note && (
                                                <span className="text-muted-foreground ml-2">— {r.note}</span>
                                            )}
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
                                {deal.terms.map((term, i) => (
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
                            <ol className="space-y-3">
                                {deal.guidelines.map((step, i) => (
                                    <li key={i} className="flex gap-3 text-sm">
                                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="text-muted-foreground mt-0.5">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    )}
                </div>

                {/* Sticky sidebar */}
                <div className="space-y-4">
                    <div className="bg-card rounded-xl p-6 border border-border shadow-sm lg:sticky lg:top-6">
                        <div className="text-2xl font-black mb-1">{deal.discount}</div>
                        <p className="text-sm text-muted-foreground mb-4">{deal.subtitle}</p>

                        {/* Assume deal object might have minimumSpend from DB eventually */}
                        {/* @ts-ignore */}
                        {deal.minimumSpend && (
                            <div className="text-sm font-medium text-destructive mb-4">
                                {/* @ts-ignore */}
                                Minimum Spend: ${deal.minimumSpend}
                            </div>
                        )}

                        {deal.verificationMethod && (
                            <div className="flex items-center gap-2 text-sm mb-4 p-3 bg-muted rounded-lg">
                                <ShieldCheck className="w-4 h-4 text-[hsl(141,73%,42%)] shrink-0" />
                                <div>
                                    <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Verified via</p>
                                    <p className="text-sm">{deal.verificationMethod}</p>
                                </div>
                            </div>
                        )}

                        <a
                            href="#"
                            className="w-full bg-primary text-primary-foreground py-3 rounded-pill text-sm font-medium hover:opacity-80 transition-opacity flex items-center justify-center gap-2 no-underline"
                        >
                            {deal.cta}
                            <ExternalLink className="w-4 h-4" />
                        </a>

                        <p className="text-xs text-muted-foreground text-center mt-3">
                            You&apos;ll be redirected to {deal.brand}&apos;s website
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
                            /* @ts-ignore */
                            conditions={deal.conditions || deal.terms}
                            /* @ts-ignore */
                            termsUrl={deal.termsUrl}
                        />
                    </div>
                </div>
            </div>

            {/* Similar deals */}
            {similar.length > 0 && (
                <section className="p-4 md:p-6 pt-0">
                    <h2 className="text-lg font-bold mb-4">More {deal.category} Deals</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {similar.map((d) => (
                            <DealCardLink key={d.id} deal={d} className="h-[300px]" />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
