import CuratedCarousel, { type ApiCollectionResponse } from "./CuratedCarousel";
import DealCardLink, { type ApiDealResponse } from "./DealCardLink";
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
        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-background">
            <CuratedCarousel collections={collections} />
            {featuredDeals.map((dealWrapper) => (
                <DealCardLink key={dealWrapper.deal.id} dealData={dealWrapper} className="h-[300px]" />
            ))}

            {/* If there are no featured deals at all, show a fallback message */}
            {featuredDeals.length === 0 && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-2 flex items-center justify-center p-6 text-muted-foreground border border-dashed rounded-lg bg-muted/50">
                    No active featured deals found.
                </div>
            )}
        </main>
    );
};

export default DealsGrid;
