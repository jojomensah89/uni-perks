import { MapPin, Globe } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Perk } from "@/types";

interface PerkCardProps {
    perk: Perk;
    userCountry?: string;
}

export function PerkCard({ perk, userCountry }: PerkCardProps) {
    const isAvailableLocally = userCountry && perk.availableCountries?.includes(userCountry);

    return (
        <Link
            href={`/perks/${perk.slug}` as any}
            className="group block rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg border bg-muted">
                        {perk.companyLogo ? (
                            <Image
                                src={perk.companyLogo}
                                alt={perk.company}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xl font-bold text-gray-400">
                                {perk.company.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold leading-tight group-hover:text-primary">
                            {perk.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{perk.company}</p>
                    </div>
                </div>

                {perk.valueAmount && (
                    <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                            {perk.valueCurrency === 'USD' && '$'}{perk.valueAmount}
                        </div>
                    </div>
                )}
            </div>

            <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                {perk.shortDescription}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                {perk.isGlobal ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        <Globe className="h-3 w-3" />
                        Global
                    </span>
                ) : isAvailableLocally ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        <MapPin className="h-3 w-3" />
                        Available for you
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {perk.availableCountries?.length || 0} Countries
                    </span>
                )}
            </div>
        </Link>
    );
}
