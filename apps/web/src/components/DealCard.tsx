import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// API response type - matches the shape returned by deal.repository.ts
export interface ApiDealResponse {
    deal: {
        id: string;
        slug: string;
        title: string;
        shortDescription: string;
        longDescription?: string;
        discountType?: string;
        discountLabel: string;
        discountValue?: number | null;
        originalPrice?: number | null;
        studentPrice?: number | null;
        currency?: string | null;
        verificationMethod: string;
        claimUrl: string;
        coverImageUrl?: string | null;
        isFeatured?: boolean | null;
        isActive?: boolean | null;
        expirationDate?: string | null;
        howToRedeem?: string | null;
        conditions?: string | null;
    };
    brand: {
        id: string;
        name: string;
        slug?: string;
        logoUrl?: string | null;
        coverImageUrl?: string | null;
    };
    category: {
        id: string;
        name: string;
        slug: string;
        color?: string | null;
    };
}

interface DealCardProps {
    dealData: ApiDealResponse;
    className?: string;
    variant?: "default" | "compact";
}

// Helper to get image URL - uses R2 serving route for keys, or returns full URLs as-is
function getImageUrl(keyOrUrl: string | null | undefined): string | undefined {
    if (!keyOrUrl) return undefined;
    // If it's already a full URL, return as-is
    if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) {
        return keyOrUrl;
    }
    // Otherwise, construct URL via our images API route
    const apiBase = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
    return `${apiBase}/api/images/${keyOrUrl}`;
}

// Category color mapping for fallback backgrounds
const CATEGORY_COLORS: Record<string, string> = {
    "tech-software": "bg-blue-500/20",
    "streaming": "bg-red-500/20",
    "food-delivery": "bg-orange-500/20",
    "fashion": "bg-pink-500/20",
    "travel": "bg-green-500/20",
    "education": "bg-purple-500/20",
    "health-wellness": "bg-teal-500/20",
    "entertainment": "bg-indigo-500/20",
    "sports-outdoors": "bg-amber-500/20",
};

// Format urgency text
function getUrgencyText(expirationDate: string | null | undefined): string | null {
    if (!expirationDate) return null;
    const exp = new Date(expirationDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 0) return "Expired";
    if (daysUntilExpiry === 1) return "ENDS TODAY";
    if (daysUntilExpiry <= 3) return `ENDS IN ${daysUntilExpiry} DAYS`;
    return null;
}

const DealCard = ({ dealData, className = "", variant = "default" }: DealCardProps) => {
    const { deal, brand, category } = dealData;

    // Determine cover image source
    const coverImage = getImageUrl(deal.coverImageUrl) || getImageUrl(brand.coverImageUrl);

    // Get category color for fallback
    const categoryColor = category.color || CATEGORY_COLORS[category.slug] || "bg-muted";

    // Urgency badge logic
    const urgencyText = getUrgencyText(deal.expirationDate);

    return (
        <Link 
            href={`/deals/${deal.slug}`} 
            className={cn("no-underline block h-full", className)}
        >
            <article className="group relative bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                {/* Image Section - 4:3 aspect ratio */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {coverImage ? (
                        <img
                            src={coverImage}
                            alt={`${brand.name} - ${deal.discountLabel}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        // Fallback with brand initial or logo
                        <div className={cn("w-full h-full flex items-center justify-center", categoryColor)}>
                            {brand.logoUrl ? (
                                <img
                                    src={getImageUrl(brand.logoUrl) || ""}
                                    alt={brand.name}
                                    className="w-16 h-16 object-contain opacity-50"
                                    loading="lazy"
                                />
                            ) : (
                                <span className="text-4xl font-bold text-foreground/30">
                                    {brand.name.charAt(0)}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Logo Badge - Bottom Left on Image */}
                    {brand.logoUrl && (
                        <div className="absolute bottom-3 left-3 h-12 w-12 md:h-16 md:w-16 bg-card rounded-lg border border-border shadow-md flex items-center justify-center overflow-hidden">
                            <img
                                src={getImageUrl(brand.logoUrl) || ""}
                                alt={`${brand.name} logo`}
                                className="w-8 h-8 md:w-12 md:h-12 object-contain"
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* Featured Badge - Top Right */}
                    {deal.isFeatured && (
                        <div className="absolute top-3 right-3">
                            <Badge variant="default" className="text-[10px] font-bold uppercase tracking-wide">
                                Featured
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Content Section - Clean text area */}
                <CardContent className="p-4 md:p-5 flex-1 flex flex-col space-y-2">
                    {/* Discount Label - Bold headline */}
                    <h3 className="text-base font-bold leading-tight text-foreground">
                        {deal.discountLabel}
                    </h3>

                    {/* Urgency Badge - In text area (per spec) */}
                    {urgencyText && (
                        <Badge 
                            variant="destructive" 
                            className={cn(
                                "w-fit gap-1 text-[11px] font-semibold uppercase tracking-wide",
                                urgencyText === "Expired" && "bg-muted-foreground"
                            )}
                        >
                            <Clock className="h-3 w-3" />
                            {urgencyText}
                        </Badge>
                    )}

                    {/* Brand Name */}
                    <p className="text-sm font-semibold text-foreground/90">
                        {brand.name}
                    </p>

                    {/* Category + Availability Tags */}
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-primary" />
                            For students
                        </span>
                        <span className="text-muted-foreground/50">·</span>
                        <span>Online</span>
                        <span className="text-muted-foreground/50">·</span>
                        <span>{category.name}</span>
                    </p>
                </CardContent>
            </article>
        </Link>
    );
};

export default DealCard;
