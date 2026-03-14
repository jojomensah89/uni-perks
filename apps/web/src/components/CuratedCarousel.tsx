"use client";

import Autoplay from "embla-carousel-autoplay";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import DealTag from "./DealTag";

// We'll define the expected structure of a Collection response here
export type ApiCollectionResponse = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    audience: string | null;
    coverImageUrl?: string | null;
    isFeatured: boolean;
};

// We can reuse the same decorations or define new ones for Collections
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
};

const EMPTY_COLLECTIONS: ApiCollectionResponse[] = [];

const CuratedCarousel = ({ collections = EMPTY_COLLECTIONS }: { collections: ApiCollectionResponse[] }) => {
    if (collections.length === 0) {
        return <div className="col-span-1 lg:col-span-2 rounded-lg bg-muted p-6 flex flex-col items-center justify-center text-muted-foreground min-h-[300px] border border-dashed border-border">
            <p className="font-semibold text-foreground mb-1">No Curated Collections found.</p>
            <p className="text-sm">Add some featured collections in the admin panel.</p>
        </div>;
    }

    const fallbackColors = ['bg-[#0F172A]', 'bg-[#1E1B4B]', 'bg-[#064E3B]', 'bg-[#4C1D95]', 'bg-[#831843]'];
    const decorationKeys = Object.keys(decorations);

    return (
        <Carousel
            className="col-span-1 lg:col-span-2 w-full h-full min-h-[300px]"
            opts={{ loop: true }}
            plugins={[Autoplay({ delay: 6000 })]}
        >
            <CarouselContent className="h-full">
                {collections.map((collection, index) => {
                    const randomFallback = fallbackColors[collection.id.charCodeAt(0) % fallbackColors.length];
                    const decorationKey = decorationKeys[collection.id.charCodeAt(0) % decorationKeys.length];

                    return (
                        <CarouselItem key={collection.id} className="h-full">
                            <Link href={`/collections/${collection.slug}` as any} className="block w-full h-full">
                                <article
                                    className={`w-full h-full min-h-[300px] rounded-lg overflow-hidden flex flex-col relative p-6 transition-all duration-500 border-0 shadow-md ${randomFallback} text-primary-foreground hover:opacity-95 hover:scale-[1.01]`}
                                >
                                    <div className="flex gap-1.5 mb-4 flex-wrap z-20 relative">
                                        <DealTag label="Curated Collection" variant="light" />
                                        {collection.audience && <DealTag label={collection.audience} variant="light" />}
                                    </div>
                                    <div className="flex flex-col h-full relative z-20 relative justify-center">
                                        <h2 className="text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] mb-3 whitespace-pre-line font-black tracking-tight" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                                            {collection.name}
                                        </h2>
                                        {collection.description && (
                                            <p className={`text-base md:text-lg max-w-[400px] opacity-90 drop-shadow-sm`}>
                                                {collection.description}
                                            </p>
                                        )}
                                        <div className="mt-8 flex items-center">
                                            <span className={`inline-flex items-center gap-2 underline underline-offset-4 text-sm font-bold text-white drop-shadow-sm transition-opacity`}>
                                                Explore Collection
                                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Decoration */}
                                    {decorations[decorationKey]}

                                    {/* Gradient Darkener to ensure text is always readable */}
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent z-10 pointer-events-none`} />
                                </article>
                            </Link>
                        </CarouselItem>
                    );
                })}
            </CarouselContent>

            {/* Navigation controls */}
            <div className="absolute right-6 bottom-10 z-30 hidden sm:flex gap-2">
                <CarouselPrevious className="relative inset-auto translate-x-0 translate-y-0 h-10 w-10 bg-black/30 text-white border-white/20 hover:bg-black/60 hover:text-white backdrop-blur-sm" />
                <CarouselNext className="relative inset-auto translate-x-0 translate-y-0 h-10 w-10 bg-black/30 text-white border-white/20 hover:bg-black/60 hover:text-white backdrop-blur-sm" />
            </div>
        </Carousel>
    );
};

export default CuratedCarousel;
