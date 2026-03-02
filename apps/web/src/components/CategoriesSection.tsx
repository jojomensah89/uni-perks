import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from "@/components/ui/carousel";
import DealCard, { type ApiDealResponse } from "./DealCard";
import { fetchAPI } from "@/lib/api";

type ApiCategoryResponse = {
    id: string;
    name: string;
    slug: string;
};

const CategoryCarousel = async ({ category }: { category: ApiCategoryResponse }) => {
    // Fetch deals for this specific category
    const res = await fetchAPI<{ deals: ApiDealResponse[] }>(`/api/deals?category=${category.slug}&limit=10`);
    const deals = res.deals || [];

    if (deals.length === 0) return null;

    return (
        <div className="mb-8 relative px-4">
            <Carousel
                opts={{
                    align: "start",
                    dragFree: true,
                    loop: true,
                }}
                className="w-full"
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold tracking-tight">{category.name}</h3>
                    <div className="hidden sm:flex gap-2 mr-2">
                        <CarouselPrevious className="static translate-y-0 translate-x-0 h-8 w-8 bg-background border-border hover:bg-muted" />
                        <CarouselNext className="static translate-y-0 translate-x-0 h-8 w-8 bg-background border-border hover:bg-muted" />
                    </div>
                </div>

                <CarouselContent className="-ml-4">
                    {deals.map((dealWrapper) => (
                        <CarouselItem key={dealWrapper.deal.id} className="pl-4 basis-auto">
                            <DealCard
                                dealData={dealWrapper}
                                className="w-[280px]"
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
};

const CategoriesSection = async () => {
    // Fetch all categories
    const categoriesRes = await fetchAPI<{ categories: ApiCategoryResponse[] }>("/api/categories");
    const categories = categoriesRes.categories || [];

    if (categories.length === 0) return null;

    return (
        <section className="py-8 bg-muted/30">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-sm font-bold uppercase tracking-widest px-4 mb-6 text-muted-foreground">
                    Browse by Category
                </h2>
                {categories.map((cat) => (
                    <CategoryCarousel key={cat.id} category={cat} />
                ))}
            </div>
        </section>
    );
};

export default CategoriesSection;
