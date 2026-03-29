import CuratedCarousel, { type ApiCollectionResponse } from "./CuratedCarousel";
import DealCard, { type ApiDealResponse } from "./DealCard";
import { fetchAPISafe } from "@/lib/api";

const DealsGrid = async () => {
    // Use safe API wrapper for graceful degradation
    const [collectionsResult, featuredResult] = await Promise.all([
        fetchAPISafe<{ collections: ApiCollectionResponse[] }>("/api/collections?featured=true"),
        fetchAPISafe<{ deals: ApiDealResponse[] }>("/api/deals?featured=true&limit=6")
    ]);

    const collections = collectionsResult.success ? collectionsResult.data.collections || [] : [];
    const featuredDeals = featuredResult.success ? featuredResult.data.deals || [] : [];

    // Show error state if API failed (but don't crash)
    const hasError = !collectionsResult.success || !featuredResult.success;

    return (
        <section className="py-12 px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Curated & Featured</h2>
                
                {hasError && (
                    <div className="mb-6 p-4 bg-muted/50 border border-dashed border-muted-foreground/20 rounded-lg text-center text-muted-foreground">
                        Some content couldn&apos;t be loaded. Showing available deals below.
                    </div>
                )}
                
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
                {featuredDeals.length === 0 && !hasError && (
                    <div className="col-span-full flex items-center justify-center p-6 text-muted-foreground border border-dashed rounded-lg bg-muted/50">
                        No active featured deals found.
                    </div>
                )}
            </div>
        </section>
    );
};

export default DealsGrid;
