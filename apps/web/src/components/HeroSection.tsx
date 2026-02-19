"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { allDeals } from "@/data/deals";

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <section className="py-16 md:py-24 px-4 text-center relative overflow-hidden">
            {/*Subtle decorative elements*/}
            <div className="absolute top-8 left-8 text-foreground/5 text-6xl font-black select-none">%</div>
            <div className="absolute bottom-8 right-8 text-foreground/5 text-6xl font-black select-none rotate-12">$</div>

            <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[0.95] tracking-[-0.04em] uppercase mb-6">
                The best student
                <br />
                perks.{" "}
                <span className="bg-[hsl(65,100%,60%)] px-3 py-1 inline-block mt-2">
                    All free.
                </span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-8">
                {allDeals.length}+ verified student discounts on software, food, fashion, travel, and more. Stop paying full price.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="max-w-lg mx-auto relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search deals... (Spotify, Nike, GitHub...)"
                    className="w-full bg-muted rounded-pill pl-13 pr-28 py-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground/20 transition-shadow border border-border"
                    style={{ paddingLeft: "3.25rem" }}
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-5 py-2.5 rounded-pill text-sm font-medium hover:opacity-80 transition-opacity"
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
                        className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-pill text-xs font-medium transition-colors"
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </section>
    );
};

export default HeroSection;
