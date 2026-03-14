import { notFound } from "next/navigation";
import DealCard, { type ApiDealResponse } from "@/components/DealCard";
import { fetchAPI } from "@/lib/api";
import type { ApiCollectionResponse } from "@/components/CuratedCarousel";

interface CollectionPageProps {
    params: {
        slug: string;
    };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
    const { slug } = await params;

    // Fetch the collection and its deals from the combined API endpoint
    const res = await fetchAPI<{ collection: ApiCollectionResponse, deals: ApiDealResponse[] }>(`/api/collections/${slug}`);

    // The API returns 404 or throws if not found, but we should handle nulls gracefully
    if (!res || !res.collection) {
        return notFound();
    }

    const { collection, deals } = res;

    const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
    const getImageUrl = (keyOrUrl: string | null | undefined) => {
        if (!keyOrUrl) return null;
        if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) return keyOrUrl;
        return `${API_URL}/api/images/${keyOrUrl}`;
    };

    const coverUrl = getImageUrl(collection.coverImageUrl);

    return (
        <div className="max-w-[1440px] mx-auto bg-background min-h-screen">
            {/* Header Area */}
            <div 
                className="relative px-4 md:px-8 py-12 md:py-24 mb-8 border-b border-border overflow-hidden rounded-b-[2rem] md:rounded-b-[3rem]"
                style={{ 
                    background: coverUrl ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${coverUrl})` : "var(--muted)",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="max-w-4xl relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-primary/20 backdrop-blur-md text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
                            Curated Collection
                        </span>
                        {collection.audience && (
                            <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
                                {collection.audience}
                            </span>
                        )}
                    </div>
                    <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[1] tracking-tight mb-4 text-white drop-shadow-xl">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-lg md:text-2xl text-white/80 max-w-2xl leading-relaxed drop-shadow-md">
                            {collection.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Deals Grid */}
            <div className="p-4 md:p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold tracking-tight">Included Deals</h2>
                    <span className="text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full text-sm">
                        {deals.length} active offer{deals.length === 1 ? '' : 's'}
                    </span>
                </div>

                {deals.length === 0 ? (
                    <div className="py-24 text-center border-2 border-dashed border-border rounded-xl">
                        <p className="text-xl font-semibold mb-2">Check back soon!</p>
                        <p className="text-muted-foreground">We're updating the deals in this collection.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {deals.map((dealWrapper) => (
                            <DealCard key={dealWrapper.deal.id} dealData={dealWrapper} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
