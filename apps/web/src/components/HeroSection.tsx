"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const router = useRouter();

    // Fetch deal count from API
    const { data } = useQuery({
        queryKey: ["deal-count"],
        queryFn: () => fetchAPI<{ meta: { total: number } }>("/api/deals?limit=1"),
    });

    const dealCount = data?.meta?.total || 0;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <section className="relative overflow-hidden">
            {/* Ticker Bar */}
            <div className="bg-foreground py-2 overflow-hidden">
                <div className="animate-[ticker_30s_linear_infinite] whitespace-nowrap font-mono text-xs uppercase tracking-widest text-primary">
                    <span className="inline-block">
                        UNI-PERKS /// NO SIGNUP /// 100% VERIFIED /// STUDENT DEALS /// NO BS /// 
                        UNI-PERKS /// NO SIGNUP /// 100% VERIFIED /// STUDENT DEALS /// NO BS /// 
                        UNI-PERKS /// NO SIGNUP /// 100% VERIFIED /// STUDENT DEALS /// NO BS /// 
                        UNI-PERKS /// NO SIGNUP /// 100% VERIFIED /// STUDENT DEALS /// NO BS /// 
                    </span>
                </div>
            </div>

            {/* Main Hero Content */}
            <div className="py-16 md:py-20 px-4 text-center">
                {/* Decorative elements */}
                <div className="absolute top-20 left-8 text-foreground/5 text-6xl font-black select-none">%</div>
                <div className="absolute bottom-8 right-8 text-foreground/5 text-6xl font-black select-none rotate-12">$</div>

                {/* Headline with neon highlight */}
                <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[0.95] tracking-[-0.04em] uppercase mb-6">
                    The best student
                    <br />
                    perks.{" "}
                    <span className="bg-primary text-primary-foreground px-4 py-1 inline-block mt-2">
                        Zero signup.
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-8 font-mono">
                    {dealCount > 0 ? `${dealCount}+` : "Hundreds of"} verified student discounts on software, food, fashion, travel, and more. Stop paying full price.
                </p>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="max-w-lg mx-auto relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search deals... (Spotify, Nike, GitHub...)"
                        className="w-full bg-muted rounded-full pl-14 pr-28 py-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring transition-shadow border border-border"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Search
                    </button>
                </form>

                {/* Quick filters */}
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {["Free", "Software", "Food", "Fashion", "Travel"].map((tag) => (
                        <button
                            key={tag}
                            onClick={() => router.push(`/browse?q=${encodeURIComponent(tag)}`)}
                            className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground px-4 py-2 rounded-full text-xs font-medium transition-colors border border-border/50"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
