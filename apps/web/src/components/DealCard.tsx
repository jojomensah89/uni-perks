import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface DealCardProps {
    deal: {
        id: string;
        slug: string;
        title: string;
        shortDescription: string;
        longDescription?: string;
        discountLabel: string;
        brand: {
            name: string;
            logoUrl?: string;
        };
        category?: {
            name: string;
            slug: string;
        };
        tags?: Array<{ id: string; name: string }>;
        coverImageUrl?: string;
    };
    className?: string;
}

export function DealCard({ deal, className = '' }: DealCardProps) {
    const imageUrl = deal.coverImageUrl || deal.brand.logoUrl || '/placeholder-deal.jpg';
    const altText = `${deal.brand.name} student discount - ${deal.discountLabel}`;

    return (
        <Link
            href={`/deals/${deal.slug}`}
            className={`no-underline ${className}`}
            aria-label={`View ${deal.title} - ${deal.discountLabel}`}
        >
            <article className="group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-500 border-0 shadow-md hover:shadow-2xl hover:z-10 h-full">
                {/* Background image */}
                <div className="absolute inset-0">
                    <Image
                        src={imageUrl}
                        alt={altText}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        loading="lazy"
                    />
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-75 group-hover:opacity-85 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-5 text-white">
                    {/* Tags */}
                    {deal.tags && deal.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mb-auto" role="list">
                            {deal.tags.slice(0, 3).map((tag) => (
                                <Badge
                                    key={tag.id}
                                    variant="secondary"
                                    className="rounded-full px-3 py-1 text-[0.7rem] font-medium uppercase border border-white/40 text-white bg-white/10 backdrop-blur-sm"
                                >
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Bottom content */}
                    <div className="mt-auto">
                        {/* Discount badge */}
                        <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide mb-3 border border-white/30">
                            {deal.discountLabel}
                        </div>

                        {/* Logo + Brand */}
                        <div className="flex items-center gap-2.5 mb-1">
                            {deal.brand.logoUrl && (
                                <div className="w-7 h-7 relative flex-shrink-0">
                                    <Image
                                        src={deal.brand.logoUrl}
                                        alt={`${deal.brand.name} logo`}
                                        fill
                                        className="object-contain"
                                        sizes="28px"
                                    />
                                </div>
                            )}
                            <h3 className="text-xl font-bold leading-tight">{deal.brand.name}</h3>
                        </div>
                        <p className="text-sm opacity-90 line-clamp-2">{deal.shortDescription}</p>
                    </div>
                </div>

                {/* Hover reveal panel - slides up from bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-card text-card-foreground translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20 p-4 rounded-b-lg border-0">
                    <div className="flex items-center gap-2 mb-2">
                        {deal.brand.logoUrl && (
                            <div className="w-5 h-5 relative flex-shrink-0">
                                <Image
                                    src={deal.brand.logoUrl}
                                    alt={`${deal.brand.name} logo`}
                                    fill
                                    className="object-contain"
                                    sizes="20px"
                                />
                            </div>
                        )}
                        <span className="text-sm font-bold">{deal.brand.name}</span>
                        <span className="ml-auto text-xs font-semibold text-muted-foreground uppercase">
                            {deal.discountLabel}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">
                        {deal.longDescription || deal.shortDescription}
                    </p>
                    <div className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                        View details
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                </div>
            </article>
        </Link>
    );
}
