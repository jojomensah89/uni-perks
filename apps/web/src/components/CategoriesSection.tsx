"use client";

import { useRef } from "react";
import DealCardLink from "./DealCardLink";
import { getDealsByCategory, categories } from "@/data/deals";

const CategoryCarousel = ({ name }: { name: string }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const deals = getDealsByCategory(name);

    const scroll = (dir: "left" | "right") => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
        }
    };

    if (deals.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between px-4 mb-3">
                <h3 className="text-lg font-bold tracking-tight">{name}</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll("left")}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors text-sm"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors text-sm"
                    >
                        →
                    </button>
                </div>
            </div>
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto px-4 pb-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
            >
                {deals.map((deal) => (
                    <DealCardLink key={deal.id} deal={deal} className="flex-shrink-0 w-[260px] h-[300px]" />
                ))}
            </div>
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
