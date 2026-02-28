import Link from "next/link";
import { ShieldCheck } from "lucide-react";

// Matches API return structure for findManyDeals
export interface ApiDealResponse {
    deal: {
        id: string;
        slug: string;
        title: string;
        shortDescription: string;
        discountLabel: string;
        discountType?: string;
        verificationMethod: string;
        coverImageUrl?: string;
        isFeatured?: boolean;
        expirationDate?: string | null;
        [key: string]: any;
    };
    brand: {
        id: string;
        name: string;
        slug?: string;
        logoUrl?: string;
        coverImageUrl?: string;
        [key: string]: any;
    };
    category: {
        id: string;
        name: string;
        slug: string;
        color?: string;
        [key: string]: any;
    };
}

interface DealCardLinkProps {
    dealData: ApiDealResponse;
    className?: string;
    variant?: "default" | "compact";
}

// Category color mapping (can be moved to config later)
const CATEGORY_COLORS: Record<string, string> = {
    "tech-software": "bg-blue-500",
    "streaming": "bg-red-500",
    "food-delivery": "bg-orange-500",
    "fashion": "bg-pink-500",
    "travel": "bg-green-500",
    "education": "bg-purple-500",
    "health-wellness": "bg-teal-500",
    "entertainment": "bg-indigo-500",
};

const DealCardLink = ({ dealData, className = "", variant = "default" }: DealCardLinkProps) => {
    const { deal, brand, category } = dealData;

    // Get category color or fallback
    const categoryColor = category.color || CATEGORY_COLORS[category.slug] || "bg-gray-500";

    // Determine cover image source
    const coverImage = deal.coverImageUrl || brand.coverImageUrl;

    // Check if deal is expiring soon (within 7 days)
    const isExpiring = deal.expirationDate && new Date(deal.expirationDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

    return (
        <Link href={`/deals/${deal.slug}`} className="no-underline block h-full">
            <article className={`group relative bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col ${className}`}>
                {/* Cover Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden">
                    {coverImage ? (
                        <img
                            src={coverImage}
                            alt={brand.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className={`w-full h-full ${categoryColor} flex items-center justify-center`}>
                            {brand.logoUrl ? (
                                <img
                                    src={brand.logoUrl}
                                    alt={brand.name}
                                    className="w-16 h-16 object-contain opacity-50"
                                />
                            ) : (
                                <span className="text-4xl font-bold text-white/50">
                                    {brand.name.charAt(0)}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Category Tag - Top Left */}
                    <div className="absolute top-3 left-3">
                        <span className="inline-block bg-white/90 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-full text-xs font-medium shadow-sm">
                            {category.name}
                        </span>
                    </div>

                    {/* Expiring Badge - Top Right */}
                    {isExpiring && (
                        <div className="absolute top-3 right-3">
                            <span className="inline-block bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                Ending soon
                            </span>
                        </div>
                    )}

                    {/* Featured Badge */}
                    {deal.isFeatured && (
                        <div className="absolute bottom-3 right-3">
                            <span className="inline-block bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                                Featured
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col">
                    {/* Brand Logo + Name */}
                    <div className="flex items-center gap-2 mb-2">
                        {brand.logoUrl ? (
                            <img
                                src={brand.logoUrl}
                                alt={brand.name}
                                className="w-8 h-8 object-contain rounded"
                            />
                        ) : (
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center font-bold text-sm text-muted-foreground">
                                {brand.name.charAt(0)}
                            </div>
                        )}
                        <h3 className="font-semibold text-foreground text-sm truncate">
                            {brand.name}
                        </h3>
                    </div>

                    {/* Discount Label */}
                    <p className="text-lg font-bold text-foreground mb-1">
                        {deal.discountLabel}
                    </p>

                    {/* Short Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                        {deal.title}
                    </p>

                    {/* Verification Badge */}
                    {deal.verificationMethod && (
                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs text-muted-foreground capitalize">
                                {deal.verificationMethod.replace(/_/g, ' ')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                        Get Deal
                    </span>
                </div>
            </article>
        </Link>
    );
};

export default DealCardLink;
