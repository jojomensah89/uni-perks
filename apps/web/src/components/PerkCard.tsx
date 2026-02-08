import { Globe, MapPin, Star, ExternalLink, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Perk } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PerkCardProps {
    perk: Perk;
    userCountry?: string;
}

export function PerkCard({ perk, userCountry }: PerkCardProps) {
    const isAvailableLocally = userCountry && perk.availableCountries?.includes(userCountry);

    return (
        <div className="group flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
            <div>
                {/* Header: Logo + Title + Star */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                            {perk.companyLogo ? (
                                <Image
                                    src={perk.companyLogo}
                                    alt={perk.company}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-secondary text-xl font-bold text-muted-foreground">
                                    {perk.company.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold leading-tight group-hover:text-primary line-clamp-1">
                                {perk.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">{perk.company}</p>
                        </div>
                    </div>
                    {perk.isFeatured && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0" />
                    )}
                </div>

                {/* Value Badge */}
                <div className="mt-4">
                    {perk.valueAmount ? (
                        <div className="inline-flex items-center rounded-md bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 text-sm font-bold text-blue-700 dark:text-blue-300">
                            {perk.valueAmount === 0 ? 'Free' : `Up to $${perk.valueAmount.toLocaleString()}`}
                        </div>
                    ) : (
                        <div className="inline-flex items-center rounded-md bg-green-100 dark:bg-green-900/30 px-2.5 py-1 text-sm font-bold text-green-700 dark:text-green-300">
                            Free Access
                        </div>
                    )}
                </div>

                {/* Description */}
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {perk.shortDescription}
                </p>

                {/* Tags / Location */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {perk.region && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-normal">
                            <Globe className="mr-1 h-3 w-3" />
                            {perk.region}
                        </Badge>
                    )}
                    {!perk.isGlobal && !perk.region && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-normal">
                            <MapPin className="mr-1 h-3 w-3" />
                            {perk.availableCountries?.length || 0} Countries
                        </Badge>
                    )}
                    {perk.isGlobal && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-normal">
                            <Globe className="mr-1 h-3 w-3" />
                            Global
                        </Badge>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="w-full">
                    <Link href={`/perks/${perk.slug}` as any} className='flex items-center justify-between'>
                        Details <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                </Button>
                <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href={'#'} target="_blank" rel="noopener noreferrer" className='flex items-center justify-between'>
                        Apply <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
