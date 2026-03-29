import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Flame, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
        currency?: string | null;
        claimUrl: string;
        coverImageUrl?: string | null;
        isFeatured?: boolean | null;
        isActive?: boolean | null;
        expiresAt?: string | null;
        hotnessScore?: number | null;
        howToRedeem?: string | null;
        conditions?: string | null;
        clickCount?: number | null;
        viewCount?: number | null;
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
    _localImageOverride?: string | null;
}

function getImageUrl(keyOrUrl: string | null | undefined): string | undefined {
    if (!keyOrUrl) return undefined;
    if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) {
        return keyOrUrl;
    }
    const apiBase = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
    return `${apiBase}/api/images/${keyOrUrl}`;
}

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

function getUrgencyInfo(expiresAt: string | null | undefined): { text: string | null; variant: "destructive" | "secondary" | null } {
    if (!expiresAt) return { text: null, variant: null };
    const exp = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 0) return { text: "Expired", variant: "secondary" };
    if (daysUntilExpiry === 1) return { text: "ENDS TODAY", variant: "destructive" };
    if (daysUntilExpiry <= 3) return { text: `ENDS IN ${daysUntilExpiry} DAYS`, variant: "destructive" };
    if (daysUntilExpiry <= 7) return { text: `${daysUntilExpiry} days left`, variant: "secondary" };
    return { text: null, variant: null };
}

function isHotDeal(hotnessScore: number | null | undefined): boolean {
    return (hotnessScore ?? 50) >= 75;
}

const DealCard = ({ dealData, className = "", variant = "default", _localImageOverride }: DealCardProps) => {
    const { deal, brand, category } = dealData;

    const coverImage = _localImageOverride
        || getImageUrl(deal.coverImageUrl)
        || getImageUrl(brand.coverImageUrl);

    const categoryColor = category.color || CATEGORY_COLORS[category.slug] || "bg-muted";
    const urgency = getUrgencyInfo(deal.expiresAt);
    const hot = isHotDeal(deal.hotnessScore);

    return (
        <Link
            href={`/deals/${deal.slug}`}
            className={cn("no-underline block h-full", className)}
        >
            <article className="group relative bg-card rounded-lg overflow-hidden border border-foreground/10 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {coverImage ? (
                        <Image
                            src={coverImage}
                            alt={`${brand.name} - ${deal.discountLabel}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            unoptimized
                        />
                    ) : (
                        <div className={cn("w-full h-full flex items-center justify-center", categoryColor)}>
                            {brand.logoUrl ? (
                                <Image
                                    src={getImageUrl(brand.logoUrl) || ""}
                                    alt={brand.name}
                                    width={64}
                                    height={64}
                                    className="object-contain opacity-50"
                                    unoptimized
                                />
                            ) : (
                                <span className="text-4xl font-bold text-foreground/30">
                                    {brand.name.charAt(0)}
                                </span>
                            )}
                        </div>
                    )}

                    {/* HOT Badge - Top Right */}
                    {hot && (
                        <div className="absolute top-3 right-3">
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white gap-1 font-bold shadow-lg">
                                <Flame className="h-3 w-3" />
                                HOT
                            </Badge>
                        </div>
                    )}

                    {/* Logo Badge - Bottom Left on Image */}
                    {brand.logoUrl && (
                        <div className="absolute bottom-3 left-3 h-12 w-12 md:h-16 md:w-16 bg-card rounded-lg border border-foreground/10 shadow-md flex items-center justify-center overflow-hidden">
                            <Image
                                src={getImageUrl(brand.logoUrl) || ""}
                                alt={`${brand.name} logo`}
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    )}
                </div>

                <CardContent className="p-4 md:p-5 flex-1 flex flex-col space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold leading-tight text-foreground">
                            {deal.discountLabel}
                        </h3>
                        {deal.isFeatured && (
                            <Badge variant="default" className="text-[10px] font-bold uppercase tracking-wide shrink-0">
                                Featured
                            </Badge>
                        )}
                    </div>

                    {urgency.text && (
                        <Badge
                            variant={urgency.variant ?? "secondary"}
                            className={cn(
                                "w-fit gap-1 text-[11px] font-semibold uppercase tracking-wide",
                            )}
                        >
                            <Clock className="h-3 w-3" />
                            {urgency.text}
                        </Badge>
                    )}

                    <p className="text-sm font-semibold text-foreground/90">
                        {brand.name}
                    </p>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                        <span>Online</span>
                        <span className="text-muted-foreground/50">·</span>
                        <span>{category.name}</span>
                    </p>

                    {deal.clickCount !== undefined && deal.clickCount !== null && deal.clickCount > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Users className="h-3 w-3" />
                            <span>
                                {deal.clickCount < 10 
                                    ? "< 10 claimed" 
                                    : deal.clickCount >= 1000 
                                        ? `${(deal.clickCount / 1000).toFixed(1)}k claimed`
                                        : `${deal.clickCount} claimed`}
                            </span>
                        </p>
                    )}
                </CardContent>
            </article>
        </Link>
    );
};

export default DealCard;
