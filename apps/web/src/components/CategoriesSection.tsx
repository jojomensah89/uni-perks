"use client";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import DealCardLink from "./DealCardLink";
import { getDealsByCategory, categories } from "@/data/deals";

const CategoryCarousel = ({ name }: { name: string }) => {
    const deals = getDealsByCategory(name);

    if (deals.length === 0) return null;

    return (
        <div className="mb-8 relative px-4">
            <Carousel
                opts={{
                    align: "start",
                    dragFree: true,
                    loop: true,
                }}
                plugins={[Autoplay({ delay: 5000 })]}
                className="w-full"
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold tracking-tight">{name}</h3>
                    <div className="hidden sm:flex gap-2 mr-2">
                        {/* We use static positioning classes instead of the absolute positioning from the default shadcn component */}
                        <CarouselPrevious className="static translate-y-0 translate-x-0 h-8 w-8 bg-background border-border hover:bg-muted" />
                        <CarouselNext className="static translate-y-0 translate-x-0 h-8 w-8 bg-background border-border hover:bg-muted" />
                    </div>
                </div>

                <CarouselContent className="-ml-4">
                    {deals.map((deal) => (
                        <CarouselItem key={deal.id} className="pl-4 basis-auto">
                            <DealCardLink
                                dealData={{ deal: deal as any, brand: { name: deal.brand } as any, category: { name: deal.category } as any }}
                                className="w-[260px] h-[300px]"
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
};

const CategoriesSection = () => {
    return (
        <section className="py-8">
            <h2 className="text-sm font-bold uppercase tracking-widest px-4 mb-6 text-muted-foreground">
                Browse by Category
            </h2>
            {categories.map((cat) => (
                <CategoryCarousel key={cat} name={cat} />
            ))}
        </section>
    );
};

export default CategoriesSection;
