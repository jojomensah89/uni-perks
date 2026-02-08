'use client';

import { SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/SearchInput";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import type { Category } from "@/types";

interface CategoryWithCount extends Category {
    count?: number;
}

interface PerksFiltersProps {
    categories: CategoryWithCount[];
    totalPerks: number;
    currentCategory?: string;
    currentFeatured?: boolean;
}

export function PerksFilters({ categories, totalPerks, currentCategory, currentFeatured }: PerksFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get current values from URL
    const currentSortBy = searchParams.get('sortBy') || 'value_desc';
    const currentSearch = searchParams.get('search');

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === null) {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`/perks?${params.toString()}` as any);
    };

    const handleCategoryChange = (value: string | null) => {
        if (!value || value === 'all') {
            updateFilter('category', null);
        } else {
            updateFilter('category', value);
        }
    };

    const handleSortChange = (value: string | null) => {
        updateFilter('sortBy', value || 'value_desc');
    };

    const handleFeaturedToggle = (checked: boolean) => {
        updateFilter('featured', checked ? 'true' : null);
    };

    const handleClearFilters = () => {
        router.push('/perks' as any);
    };

    const hasActiveFilters = currentCategory || currentFeatured || currentSearch;

    const sortOptions = [
        { value: 'value_desc', label: 'Highest Value' },
        { value: 'newest', label: 'Newest Added' },
        { value: 'popular', label: 'Most Popular' },
    ];

    const currentSortLabel = sortOptions.find(opt => opt.value === currentSortBy)?.label || 'Highest Value';

    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm mb-8 space-y-4">
            {/* Top Row: Search */}
            <div className="relative">
                <SearchInput className="w-full" placeholder="Search perks by company, name, or description..." />
            </div>

            <div className="h-px bg-border/50" />

            {/* Middle Row: Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground shrink-0 bg-muted px-2 py-1 rounded-md">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        FILTERS:
                    </div>

                    <Select value={currentCategory || 'all'} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-[180px] h-9">
                            <SelectValue>
                                {currentCategory
                                    ? categories.find(c => c.slug === currentCategory)?.name || 'All Categories'
                                    : 'All Categories'
                                }
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={currentSortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[180px] h-9">
                            <SelectValue>{currentSortLabel}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            className="h-9 px-3 text-xs"
                        >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-2 shrink-0">
                    <Switch
                        id="featured-mode"
                        checked={currentFeatured || false}
                        onCheckedChange={handleFeaturedToggle}
                    />
                    <Label htmlFor="featured-mode" className="text-sm font-bold text-muted-foreground uppercase tracking-wide cursor-pointer">
                        Featured Only
                    </Label>
                </div>
            </div>

            <div className="h-px bg-border/50" />

            {/* Bottom Row: Quick Tags */}
            <div className="flex flex-wrap gap-2">
                <Link href={"/perks" as any}>
                    <Badge variant={!currentCategory ? "default" : "secondary"} className="h-7 px-3 text-xs uppercase tracking-wide rounded-md">
                        All ({totalPerks})
                    </Badge>
                </Link>
                {categories.slice(0, 6).map(cat => (
                    <Link key={cat.id} href={`/perks?category=${cat.slug}` as any}>
                        <Badge
                            variant={currentCategory === cat.slug ? "default" : "secondary"}
                            className="h-7 px-3 text-xs uppercase tracking-wide rounded-md hover:bg-muted-foreground/20"
                        >
                            {cat.name} {cat.count !== undefined && `(${cat.count})`}
                        </Badge>
                    </Link>
                ))}
            </div>
        </div>
    );
}
