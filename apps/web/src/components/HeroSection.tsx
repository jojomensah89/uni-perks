"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import { WordRotate } from "@/components/word-rotate";
import { Badge } from "@/components/ui/badge";

const HeroSection = () => {
    // Fetch deal count from API
    const { data } = useQuery({
        queryKey: ["deal-count"],
        queryFn: () => fetchAPI<{ meta: { total: number } }>("/api/deals?limit=1"),
    });

    const dealCount = data?.meta?.total || 0;

    return (
        <section className="relative overflow-hidden py-16 md:py-24 px-4 text-center">
            {/* Decorative background text */}
            <div className="pointer-events-none select-none absolute top-8 left-8 text-foreground/[0.03] text-8xl font-black">
                %
            </div>
            <div className="pointer-events-none select-none absolute bottom-8 right-8 text-foreground/[0.03] text-8xl font-black rotate-12">
                $
            </div>

            {/* Live badge */}
            <div className="flex justify-center mb-6">
                <Badge
                    variant="outline"
                    className="gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.12em] uppercase text-primary border-primary/30 bg-primary/5"
                >
                    <span
                        className="w-1.5 h-1.5 rounded-full bg-primary inline-block"
                        style={{ animation: "blink 1.5s ease infinite" }}
                    />
                    LIVE · {dealCount > 0 ? dealCount : "100+"} ACTIVE DEALS
                    <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
                </Badge>
            </div>

            {/* Main headline with word rotate */}
            <h1 className="text-[clamp(3rem,9vw,7rem)] font-black leading-[0.93] tracking-tight uppercase mb-5">
                SEARCH EVERY
                <br />
                <span className="text-primary">
                    STUDENT{" "}
                    <WordRotate words={["DEAL", "DISCOUNT", "PERK", "OFFER", "SAVING"]} />
                </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed font-mono">
                The search engine built for students. Every discount, every
                platform, all verified.
            </p>
        </section>
    );
};

export default HeroSection;
