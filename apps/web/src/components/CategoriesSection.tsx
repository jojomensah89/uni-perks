'use client';

import { useRef } from 'react';
import { DealCard } from './DealCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Deal {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    longDescription?: string;
    discountLabel: string;
    brand: {
        name: string;
        logoUrl?: string;
    };
    category?: {
        name: string;
        slug: string;
    };
    tags?: Array<{ id: string; name: string }>;
    coverImageUrl?: string;
}

interface CategoryCarouselProps {
    category: Category;
    deals: Deal[];
}

function CategoryCarousel({ category, deals }: CategoryCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'left' | 'right') => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
        }
    };

    if (deals.length === 0) return null;

    return (
        <section className="mb-8" aria-labelledby={`category-${category.slug}`}>
            <div className="flex items-center justify-between px-4 mb-3">
                <h3 id={`category-${category.slug}`} className="text-lg font-bold tracking-tight">
                    {category.name}
                </h3>
                <div className="flex gap-2">
                    <Button
                        onClick={() => scroll('left')}
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        aria-label={`Scroll ${category.name} left`}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={() => scroll('right')}
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        aria-label={`Scroll ${category.name} right`}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                role="list"
            >
                {deals.map((deal) => (
                    <div key={deal.id} className="flex-shrink-0 w-[260px] h-[300px]" role="listitem">
                        <DealCard deal={deal} className="h-full" />
                    </div>
                ))}
            </div>
        </section>
    );
}

interface CategoriesSectionProps {
    categoriesWithDeals: Array<{
        category: Category;
        deals: Deal[];
    }>;
}

export function CategoriesSection({ categoriesWithDeals }: CategoriesSectionProps) {
    return (
        <section className="py-8" aria-labelledby="categories-heading">
            <h2
                id="categories-heading"
                className="text-sm font-bold uppercase tracking-widest px-4 mb-6 text-muted-foreground"
            >
                Browse by Category
            </h2>
            {categoriesWithDeals.map(({ category, deals }) => (
                <CategoryCarousel key={category.id} category={category} deals={deals} />
            ))}
        </section>
    );
}
