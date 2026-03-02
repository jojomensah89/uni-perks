"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

const HeroSection = () => {
    // Fetch deal count from API
    const { data } = useQuery({
        queryKey: ["deal-count"],
        queryFn: () => fetchAPI<{ meta: { total: number } }>("/api/deals?limit=1"),
    });

    const dealCount = data?.meta?.total || 0;

    return (
        <section className="relative overflow-hidden py-16 md:py-20 px-4 text-center">
            {/* Decorative elements */}
            <div className="absolute top-8 left-8 text-foreground/5 text-6xl font-black select-none">%</div>
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
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto font-mono">
                {dealCount > 0 ? `${dealCount}+` : "Hundreds of"} verified student discounts on software, food, fashion, travel, and more. Stop paying full price.
            </p>
        </section>
    );
};

export default HeroSection;
