import Link from "next/link";
import DealTag from "./DealTag";
import type { DealData } from "@/data/deals"; // fallback types if used
import { ShieldCheck, Tag } from "lucide-react";

// Matches API return structure for findManyDeals
export interface ApiDealResponse {
    deal: {
        id: string;
        slug: string;
        title: string;
        shortDescription: string;
        discountLabel: string;
        verificationMethod: string;
        [key: string]: any;
    };
    brand: {
        name: string;
        logoUrl?: string;
        [key: string]: any;
    };
    category: {
        name: string;
        [key: string]: any;
    };
}

interface DealCardLinkProps {
    dealData: ApiDealResponse;
    className?: string;
}

const DealCardLink = ({ dealData, className = "" }: DealCardLinkProps) => {
    const { deal, brand, category } = dealData;

    // Generate fallback style since DB doesn't have standard utility colors seeded fully yet
    const fallbackColors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-muted'];
    const randomFallback = fallbackColors[deal.id.charCodeAt(0) % fallbackColors.length];

    return (
        <Link href={`/deals/${deal.slug}`} className="no-underline">
            <article className={`group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-500 border-0 shadow-md hover:shadow-2xl hover:z-10 ${className}`}>
                {/* Background image fallback */}
                <div
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 bg-muted"
                />

                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${randomFallback} opacity-75 group-hover:opacity-85 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-5 text-primary-foreground">
                    {/* Tags */}
                    <div className="flex gap-1.5 flex-wrap mb-auto">
                        <DealTag key={category.name} label={category.name} variant="light" />
                    </div>

                    {/* Bottom content */}
                    <div className="mt-auto">
                        <div className="inline-block bg-primary-foreground/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide mb-3 border border-primary-foreground/30">
                            {deal.discountLabel}
                        </div>
                        <div className="flex items-center gap-2.5 mb-1">
                            {brand.logoUrl ? (
                                <img src={brand.logoUrl} className="w-7 h-7 shrink-0 object-contain" alt={brand.name} />
                            ) : (
                                <div className="w-7 h-7 shrink-0 bg-primary-foreground/20 rounded-full flex items-center justify-center font-bold text-xs">{brand.name[0]}</div>
                            )}
                            <h3 className="text-xl font-bold leading-tight">{brand.name}</h3>
                        </div>
                        <p className="text-sm opacity-90">{deal.title}</p>
                    </div>
                </div>

                {/* Hover reveal panel */}
                <div className="absolute bottom-0 left-0 right-0 bg-card text-card-foreground translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20 p-4 rounded-b-lg border-0">
                    <div className="flex items-center gap-2 mb-2">
                        {brand.logoUrl ? (
                            <img src={brand.logoUrl} className="w-5 h-5 shrink-0 object-contain" alt={brand.name} />
                        ) : (
                            <div className="w-5 h-5 shrink-0 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-[10px]">{brand.name[0]}</div>
                        )}
                        <span className="text-sm font-bold">{brand.name}</span>
                        <span className="ml-auto text-xs font-semibold text-muted-foreground uppercase">{deal.discountLabel}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">{deal.shortDescription}</p>
                    {deal.verificationMethod && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                            {deal.verificationMethod}
                        </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                        <div className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                            View details
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                        {deal.estimatedValue && (
                            <span className="text-xs font-medium text-muted-foreground">
                                Value: {deal.estimatedValue}
                            </span>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default DealCardLink;
