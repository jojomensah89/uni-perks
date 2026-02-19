import FeaturedCarousel from "./FeaturedCarousel";
import DealCardLink from "./DealCardLink";
import { getTopDeals } from "@/data/deals";

const DealsGrid = () => {
    const deals = getTopDeals();

    return (
        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-background">
            <FeaturedCarousel />
            {deals.map((deal) => (
                <DealCardLink key={deal.id} deal={deal} className="h-[320px]" />
            ))}
        </main>
    );
};

export default DealsGrid;
