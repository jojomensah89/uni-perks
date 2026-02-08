"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchAPI } from "@/lib/api";
import type { GeoData } from "@/types";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface Country {
    code: string;
    name: string;
    flag: string;
    perkCount: number;
}

export function CountrySelector() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [countries, setCountries] = useState<Country[]>([]);
    const [regions, setRegions] = useState<{ id: string; name: string; slug: string }[]>([]);
    const [userCountry, setUserCountry] = useState<string>('');
    const [selectedCountry, setSelectedCountry] = useState<string>('ALL');

    // Fetch countries, regions and user geo on mount
    useEffect(() => {
        // Determine selected item from URL
        const countryParam = searchParams.get('country');
        const regionParam = searchParams.get('region');

        if (countryParam) {
            setSelectedCountry(countryParam);
        } else if (regionParam) {
            setSelectedCountry(`REGION:${regionParam}`);
        } else {
            setSelectedCountry('ALL');
        }

        const fetchData = async () => {
            try {
                // Parallel fetch for Geo, Countries and Regions
                const [geoData, countriesData, regionsData] = await Promise.all([
                    fetchAPI<GeoData>('api/geo').catch(err => {
                        console.error('Geo fetch failed', err);
                        return null;
                    }),
                    fetchAPI<{ countries: Country[] }>('api/countries').catch(() => ({ countries: [] })),
                    fetchAPI<{ regions: { id: string; name: string; slug: string }[] }>('api/geo/regions').catch(() => ({ regions: [] }))
                ]);

                if (geoData && !countryParam && !regionParam) {
                    setUserCountry(geoData.country);
                }

                if (countriesData?.countries) {
                    setCountries(countriesData.countries);
                }

                if (regionsData?.regions) {
                    setRegions(regionsData.regions);
                }
            } catch (err) {
                console.error("Failed to fetch geo data", err);
            }
        };

        fetchData();
    }, [searchParams]);

    const handleSelect = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value === 'ALL') {
            params.delete('country');
            params.delete('region');
            setSelectedCountry('ALL');
        } else if (value.startsWith('REGION:')) {
            const regionSlug = value.split(':')[1];
            params.delete('country');
            params.set('region', regionSlug);
            setSelectedCountry(value);
        } else {
            params.delete('region');
            params.set('country', value);
            setSelectedCountry(value);
        }

        router.push(`?${params.toString()}`);
    };

    const currentCountry = countries.find(c => c.code === selectedCountry);
    const currentRegion = selectedCountry.startsWith('REGION:')
        ? regions.find(r => r.slug === selectedCountry.split(':')[1])
        : null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline" }), "gap-2 px-4 py-2 flex items-center")}>
                {selectedCountry === 'ALL' ? (
                    <>
                        <Globe className="h-4 w-4" />
                        <span>Global</span>
                    </>
                ) : currentRegion ? (
                    <>
                        <Globe className="h-4 w-4" />
                        <span>{currentRegion.name}</span>
                    </>
                ) : (
                    <>
                        <span className="text-lg leading-none">{currentCountry?.flag}</span>
                        <span>{currentCountry?.code || selectedCountry}</span>
                    </>
                )}
                <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px] max-h-[400px] overflow-y-auto">
                <DropdownMenuLabel>Filter Location</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSelect('ALL')}>
                    <Globe className="mr-2 h-4 w-4" />
                    <span>All Locations</span>
                    {selectedCountry === 'ALL' && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>

                {regions.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Regions</DropdownMenuLabel>
                        {regions.map((region) => (
                            <DropdownMenuItem key={region.slug} onClick={() => handleSelect(`REGION:${region.slug}`)}>
                                <Globe className="mr-2 h-4 w-4 opacity-50" />
                                <span>{region.name}</span>
                                {selectedCountry === `REGION:${region.slug}` && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                        ))}
                    </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Countries</DropdownMenuLabel>
                {countries.map((country) => (
                    <DropdownMenuItem key={country.code} onClick={() => handleSelect(country.code)}>
                        <span className="mr-2 text-lg leading-none">{country.flag}</span>
                        <span>{country.name}</span>
                        {selectedCountry === country.code && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
