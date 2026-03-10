"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { Search } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import DealCard, { type ApiDealResponse } from "@/components/DealCard";
import { fetchAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";

type ApiCategoryResponse = {
    id: string;
    name: string;
    slug: string;
};

type CategoryWithCount = ApiCategoryResponse & { dealCount: number };

function BrowseContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState<string | null>(
        searchParams.get("cat") || null
    );
    const [search, setSearch] = useState(searchParams.get("q") || "");

    useEffect(() => {
        const q = searchParams.get("q");
        const cat = searchParams.get("cat");
        if (q) setSearch(q);
        if (cat) setActiveCategory(cat);
    }, [searchParams]);

    // Fetch deals from API (all deals when no category is selected, for counting)
    const allDealsQuery = useQuery({
        queryKey: ["deals-all"],
        queryFn: () => {
            const params = new URLSearchParams();
            params.set("limit", "100");
            return fetchAPI<{ deals: ApiDealResponse[]; meta: { total: number } }>(
                `/api/deals?${params.toString()}`
            );
        },
    });

    // Fetch filtered deals from API
    const dealsQuery = useQuery({
        queryKey: ["deals", activeCategory, search],
        queryFn: () => {
            const params = new URLSearchParams();
            params.set("limit", "100");
            if (activeCategory) params.set("category", activeCategory);
            if (search.trim()) params.set("q", search.trim());
            return fetchAPI<{ deals: ApiDealResponse[]; meta: { total: number } }>(
                `/api/deals?${params.toString()}`
            );
        },
    });

    // Fetch categories from API
    const categoriesQuery = useQuery({
        queryKey: ["categories"],
        queryFn: () => fetchAPI<{ categories: ApiCategoryResponse[] }>("/api/categories"),
    });

    const allDeals = allDealsQuery.data?.deals || [];
    const deals = dealsQuery.data?.deals || [];
    const categories = categoriesQuery.data?.categories || [];
    const totalDeals = allDealsQuery.data?.meta?.total || 0;
    const filteredDeals = dealsQuery.data?.meta?.total || 0;
    const isLoading = dealsQuery.isLoading || categoriesQuery.isLoading;
    const isError = dealsQuery.isError;

    // Compute category counts from all deals
    const categoriesWithCounts: CategoryWithCount[] = useMemo(() => {
        if (!allDeals.length || !categories.length) {
            return categories.map(cat => ({ ...cat, dealCount: 0 }));
        }
        const countMap = new Map<string, number>();
        allDeals.forEach(deal => {
            const slug = deal.category.slug;
            countMap.set(slug, (countMap.get(slug) || 0) + 1);
        });
        return categories.map(cat => ({
            ...cat,
            dealCount: countMap.get(cat.slug) || 0,
        }));
    }, [allDeals, categories]);

    const handleSearch = (value: string) => {
        setSearch(value);
        const params = new URLSearchParams();
        if (value.trim()) params.set("q", value);
        if (activeCategory) params.set("cat", activeCategory);
        router.push(`/browse?${params.toString()}`);
    };

    const handleCategory = (cat: string | null) => {
        setActiveCategory(cat);
        const params = new URLSearchParams();
        if (search.trim()) params.set("q", search);
        if (cat) params.set("cat", cat);
        router.push(`/browse?${params.toString()}`);
    };

    return (
        <div className="max-w-[1440px] mx-auto bg-background min-h-screen flex flex-col">
            {/* Title + search */}
            <div className="px-4 md:px-6 pt-8 pb-4">
                <h1 className="text-2xl font-black tracking-tight mb-2">Browse All Deals</h1>
                <p className="text-sm text-muted-foreground mb-6">
                    {isLoading ? "Loading..." : `${totalDeals} verified student perks and discounts`}
                </p>

                {/* Search */}
                <div className="relative max-w-md mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search brand, category, or discount..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-muted rounded-full pl-11 pr-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring transition-shadow"
                    />
                    {search && (
                        <button
                            onClick={() => handleSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Category filters */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleCategory(null)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!activeCategory
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        All ({totalDeals})
                    </button>
                    {categoriesWithCounts.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategory(activeCategory === cat.slug ? null : cat.slug)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.slug
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {cat.name} ({cat.dealCount})
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 p-4 md:p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : isError ? (
                    <div className="py-16 text-center">
                        <p className="text-destructive font-semibold mb-2">Failed to load deals</p>
                        <p className="text-muted-foreground text-sm">Please try again later</p>
                    </div>
                ) : deals.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-4xl mb-4">:(</p>
                        <p className="text-muted-foreground text-sm mb-2">No deals found.</p>
                        <p className="text-muted-foreground text-xs">Try a different search term or category.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-muted-foreground mb-4 px-2">
                            {filteredDeals} deal{filteredDeals !== 1 ? "s" : ""} found
                            {activeCategory && ` in selected category`}
                            {search.trim() && ` for "${search}"`}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {deals.map((dealWrapper) => (
                                <DealCard
                                    key={dealWrapper.deal.id}
                                    dealData={dealWrapper}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function BrowsePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading deals…</div>}>
            <BrowseContent />
        </Suspense>
    );
}
