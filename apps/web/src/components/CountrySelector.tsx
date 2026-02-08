"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
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
    const [userCountry, setUserCountry] = useState<string>('');
    const [selectedCountry, setSelectedCountry] = useState<string>('ALL');

    // Fetch countries and user geo on mount
    useEffect(() => {
        // Determine selected country from URL or default to ALL
        const countryParam = searchParams.get('country');
        if (countryParam) {
            setSelectedCountry(countryParam);
        }

        const fetchData = async () => {
            try {
                // Parallel fetch for Geo and Countries
                const [geoData, countriesData] = await Promise.all([
                    fetchAPI<GeoData>('api/geo').catch(err => {
                        console.error('Geo fetch failed', err);
                        return null;
                    }),
                    // return mock for now if endpoint fails or doesn't exist yet
                    Promise.resolve({
                        countries: [
                            { code: 'US', name: 'United States', flag: '🇺🇸', perkCount: 0 },
                            { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', perkCount: 0 },
                            { code: 'CA', name: 'Canada', flag: '🇨🇦', perkCount: 0 },
                            { code: 'AU', name: 'Australia', flag: '🇦🇺', perkCount: 0 },
                        ]
                    })
                ]);

                if (geoData) {
                    setUserCountry(geoData.country);
                }

                if (countriesData && countriesData.countries) {
                    setCountries(countriesData.countries);
                }
            } catch (err) {
                console.error("Failed to fetch geo/country data", err);
            }
        };

        fetchData();
    }, [searchParams]);

    const handleSelect = (code: string) => {
        setSelectedCountry(code);
        const params = new URLSearchParams(searchParams.toString());

        if (code === 'ALL') {
            params.delete('country');
        } else {
            params.set('country', code);
        }

        router.push(`?${params.toString()}`);
    };

    const currentCountry = countries.find(c => c.code === selectedCountry);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    {selectedCountry === 'ALL' ? (
                        <>
                            <Globe className="h-4 w-4" />
                            <span>Global</span>
                        </>
                    ) : (
                        <>
                            <span className="text-lg leading-none">{currentCountry?.flag}</span>
                            <span>{currentCountry?.code}</span>
                        </>
                    )}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Select Country</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSelect('ALL')}>
                    <Globe className="mr-2 h-4 w-4" />
                    <span>All Countries</span>
                    {selectedCountry === 'ALL' && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
