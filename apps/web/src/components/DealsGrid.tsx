import CuratedCarousel, { type ApiCollectionResponse } from "./CuratedCarousel";
import DealCard, { type ApiDealResponse } from "./DealCard";
import { fetchAPI } from "@/lib/api";

const DealsGrid = async () => {
    // Fetch featured collections and featured deals from API
    const [collectionsRes, featuredRes] = await Promise.all([
        fetchAPI<{ collections: ApiCollectionResponse[] }>("/api/collections?featured=true"),
        fetchAPI<{ deals: ApiDealResponse[] }>("/api/deals?featured=true&limit=6")
    ]);

    const collections = collectionsRes.collections || [];
    const featuredDeals = featuredRes.deals || [];

    return (
        <section className="py-12 px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Curated & Featured</h2>
                
                {/* Top Row: Carousel (2 cols) + 2 DealCards */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                    <div className="lg:col-span-2">
                        <CuratedCarousel collections={collections} />
                    </div>
                    {featuredDeals.slice(0, 2).map((dealWrapper) => (
                        <DealCard key={dealWrapper.deal.id} dealData={dealWrapper} />
                    ))}
                </div>

                {/* Bottom Row: 4 DealCards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredDeals.slice(2, 6).map((dealWrapper) => (
                        <DealCard key={dealWrapper.deal.id} dealData={dealWrapper} />
                    ))}
                </div>

                {/* Fallback if no deals */}
                {featuredDeals.length === 0 && (
                    <div className="col-span-full flex items-center justify-center p-6 text-muted-foreground border border-dashed rounded-lg bg-muted/50">
                        No active featured deals found.
                    </div>
                )}
            </div>
        </section>
    );
};

export default DealsGrid;
