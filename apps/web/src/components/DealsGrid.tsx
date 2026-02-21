import FeaturedCarousel from "./FeaturedCarousel";
import DealCardLink, { type ApiDealResponse } from "./DealCardLink";
import { fetchAPI } from "@/lib/api";

const DealsGrid = async () => {
    // Fetch latest and featured deals from API
    const [dealsRes, featuredRes] = await Promise.all([
        fetchAPI<{ deals: ApiDealResponse[] }>("/api/deals?limit=12"),
        fetchAPI<{ deals: ApiDealResponse[] }>("/api/deals?featured=true")
    ]);

    const deals = dealsRes.deals || [];
    const featuredDeals = featuredRes.deals || [];

    return (
        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-background">
            <FeaturedCarousel deals={featuredDeals} />
            {deals.map((dealWrapper) => (
                <DealCardLink key={dealWrapper.deal.id} dealData={dealWrapper} className="h-[320px]" />
            ))}
        </main>
    );
};

export default DealsGrid;
