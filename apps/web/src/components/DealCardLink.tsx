import Link from "next/link";
import DealTag from "./DealTag";
import type { DealData } from "@/data/deals";
import { ShieldCheck } from "lucide-react";

interface DealCardLinkProps {
    deal: DealData;
    className?: string;
}

const DealCardLink = ({ deal, className = "" }: DealCardLinkProps) => {
    return (
        <Link href={`/deals/${deal.id}`} className="no-underline">
            <article className={`group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-500 border-0 shadow-md hover:shadow-2xl hover:z-10 ${className}`}>
                {/*Background image*/}
                <img
                    src={deal.image}
                    alt={deal.brand}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />

                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${deal.bg} opacity-75 group-hover:opacity-85 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-5 text-primary-foreground">
                    {/* Tags */}
                    <div className="flex gap-1.5 flex-wrap mb-auto">
                        {deal.tags.map((tag) => (
                            <DealTag key={tag} label={tag} variant="light" />
                        ))}
                    </div>

                    {/* Bottom content */}
                    <div className="mt-auto">
                        <div className="inline-block bg-primary-foreground/20 backdrop-blur-sm rounded-pill px-3 py-1 text-xs font-bold uppercase tracking-wide mb-3 border border-primary-foreground/30">
                            {deal.discount}
                        </div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-primary-foreground shrink-0" xmlns="http://www.w3.org/2000/svg">
                                <path d={deal.logoSvg} />
                            </svg>
                            <h3 className="text-xl font-bold leading-tight">{deal.brand}</h3>
                        </div>
                        <p className="text-sm opacity-90">{deal.subtitle}</p>
                    </div>
                </div>

                {/* Hover reveal panel */}
                <div className="absolute bottom-0 left-0 right-0 bg-card text-card-foreground translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20 p-4 rounded-b-lg border-0">
                    <div className="flex items-center gap-2 mb-2">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-foreground shrink-0" xmlns="http://www.w3.org/2000/svg">
                            <path d={deal.logoSvg} />
                        </svg>
                        <span className="text-sm font-bold">{deal.brand}</span>
                        <span className="ml-auto text-xs font-semibold text-muted-foreground uppercase">{deal.discount}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{deal.detail}</p>
                    {deal.verificationMethod && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                            {deal.verificationMethod}
                        </div>
                    )}
                    <div className="flex items-center justify-between">
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
