"use client";

import DealTag from "./DealTag";
import Autoplay from "embla-carousel-autoplay";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

import type { ApiDealResponse } from "./DealCardLink";

const decorations: Record<string, React.ReactNode> = {
    wave: (
        <div
            className="absolute -bottom-5 -right-5 w-4/5 h-3/5 pointer-events-none opacity-90"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='200' viewBox='0 0 300 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10C50 180 100 180 150 10S250 10 290 190' stroke='white' stroke-width='40' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "bottom right",
            }}
        />
    ),
    dots: (
        <div className="absolute bottom-4 right-4 w-3/5 h-2/5 pointer-events-none opacity-20">
            <svg width="100%" height="100%" viewBox="0 0 200 100">
                {Array.from({ length: 80 }).map((_, i) => (
                    <circle key={i} cx={(i % 10) * 22 + 10} cy={Math.floor(i / 10) * 14 + 5} r="3" fill="white" />
                ))}
            </svg>
        </div>
    ),
    circles: (
        <div className="absolute -bottom-10 -right-10 w-3/5 h-3/5 pointer-events-none opacity-20">
            <svg width="100%" height="100%" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="6" fill="none" />
                <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="4" fill="none" />
                <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="3" fill="none" />
            </svg>
        </div>
    ),
    zigzag: (
        <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-3/5 pointer-events-none opacity-30"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='100' viewBox='0 0 200 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 50C30 20 50 80 70 30C90 70 110 10 130 60C150 20 170 80 190 40' stroke='white' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
            }}
        />
    ),
    grid: (
        <div className="absolute bottom-4 right-4 w-2/5 h-2/5 pointer-events-none opacity-15">
            <svg width="100%" height="100%" viewBox="0 0 100 100">
                {Array.from({ length: 5 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 25} x2="100" y2={i * 25} stroke="white" strokeWidth="1" />
                ))}
                {Array.from({ length: 5 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 25} y1="0" x2={i * 25} y2="100" stroke="white" strokeWidth="1" />
                ))}
            </svg>
        </div>
    ),
};

const FeaturedCarousel = ({ deals = [] }: { deals: ApiDealResponse[] }) => {
    if (deals.length === 0) {
        return <div className="col-span-1 sm:col-span-2 rounded-lg bg-muted p-6 flex items-center justify-center text-muted-foreground">No featured deals</div>;
    }

    const fallbackColors = ['bg-primary hover:bg-primary/90', 'bg-secondary hover:bg-secondary/90', 'bg-accent hover:bg-accent/90'];
    const decorationKeys = Object.keys(decorations);

    return (
        <Carousel
            className="col-span-1 sm:col-span-2 w-full"
            opts={{ loop: true }}
            plugins={[Autoplay({ delay: 5000 })]}
        >
            <CarouselContent>
                {deals.map(({ deal, category, brand }, index) => {
                    const randomFallback = fallbackColors[deal.id.charCodeAt(0) % fallbackColors.length];
                    const decorationKey = decorationKeys[deal.id.charCodeAt(0) % decorationKeys.length];

                    return (
                        <CarouselItem key={deal.id}>
                            <article
                                className={`w-full h-full rounded-lg overflow-hidden flex flex-col relative p-6 transition-colors duration-500 border-0 shadow-md ${randomFallback} text-primary-foreground`}
                            >
                                <div className="flex gap-1.5 mb-4 flex-wrap z-20 relative">
                                    <DealTag key={category.name} label={category.name} variant="light" />
                                    {deal.isFeatured && <DealTag label="Featured" variant="default" />}
                                </div>
                                <div className="flex flex-col h-full relative z-20 relative">
                                    <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[0.95] mb-4 whitespace-pre-line font-black tracking-tight" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                                        {brand.name}'s<br />Exclusive Offer
                                    </h2>
                                    <p className={`text-sm max-w-[300px] opacity-90 drop-shadow-sm`}>
                                        {deal.title} - {deal.shortDescription}
                                    </p>
                                    <div className="mt-auto">
                                        <span className="text-lg font-semibold leading-tight drop-shadow-sm">{deal.discountLabel}</span>
                                        <a href={`/deals/${deal.slug}`} className={`block underline underline-offset-4 text-sm font-bold mt-3 text-primary-foreground drop-shadow-sm hover:opacity-80 transition-opacity`}>
                                            View Offer
                                        </a>
                                    </div>
                                </div>

                                {/* Decoration */}
                                {decorations[decorationKey]}

                                {/* Gradient Darkener to ensure text is always readable over dynamic colors */}
                                <div className={`absolute inset-0 bg-black/10 z-10 pointer-events-none`} />
                            </article>
                        </CarouselItem>
                    );
                })}
            </CarouselContent>

            {/* Shadcn Navigation (optional since dots were custom before, but these are standard) */}
            <div className="absolute right-12 bottom-6 z-30 hidden sm:flex gap-2">
                <CarouselPrevious className="relative inset-auto translate-x-0 translate-y-0 h-8 w-8 bg-black/20 text-white border-white/20 hover:bg-black/40 hover:text-white" />
                <CarouselNext className="relative inset-auto translate-x-0 translate-y-0 h-8 w-8 bg-black/20 text-white border-white/20 hover:bg-black/40 hover:text-white" />
            </div>
        </Carousel>
    );
};

export default FeaturedCarousel;
