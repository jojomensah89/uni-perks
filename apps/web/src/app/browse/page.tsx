"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { Search } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import DealCardLink from "@/components/DealCardLink";
import { allDeals, categories, searchDeals } from "@/data/deals";

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

    const filtered = useMemo(() => {
        let deals = search.trim() ? searchDeals(search) : allDeals;
        if (activeCategory) {
            deals = deals.filter((d) => d.category === activeCategory);
        }
        return deals;
    }, [activeCategory, search]);

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
                <p className="text-sm text-muted-foreground mb-6">{allDeals.length} verified student perks and discounts</p>

                {/* Search */}
                <div className="relative max-w-md mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search brand, category, or discount..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-muted rounded-pill pl-11 pr-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring transition-shadow"
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
                        className={`px-4 py-2 rounded-pill text-sm font-medium transition-colors ${!activeCategory
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        All ({allDeals.length})
                    </button>
                    {categories.map((cat) => {
                        const count = (search.trim() ? searchDeals(search) : allDeals).filter(
                            (d) => d.category === cat
                        ).length;
                        return (
                            <button
                                key={cat}
                                onClick={() => handleCategory(activeCategory === cat ? null : cat)}
                                className={`px-4 py-2 rounded-pill text-sm font-medium transition-colors ${activeCategory === cat
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {cat} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 p-4 md:p-6">
                {filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-4xl mb-4">:(</p>
                        <p className="text-muted-foreground text-sm mb-2">No deals found.</p>
                        <p className="text-muted-foreground text-xs">Try a different search term or category.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-muted-foreground mb-4 px-2">
                            {filtered.length} deal{filtered.length !== 1 ? "s" : ""} found
                            {search.trim() && ` for "${search}"`}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map((deal) => (
                                <DealCardLink key={deal.id} deal={deal} className="h-[300px]" />
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
