"use client";

import { useState, useEffect, useCallback } from "react";
import DealTag from "./DealTag";

interface KitSlide {
    tags: string[];
    title: string;
    description: string;
    price: string;
    cta: string;
    bg: string;
    decoration: "wave" | "dots" | "circles" | "zigzag" | "grid";
}

const kits: KitSlide[] = [
    {
        tags: ["Education", "Software", "Limited Time"],
        title: "Back to School\nEssentials Kit",
        description: "Get the ultimate productivity bundle. Notion Pro, Figma, and GitHub Copilot student pack all in one place.",
        price: "Free for 12 months",
        cta: "Claim bundle",
        bg: "bg-beige",
        decoration: "wave",
    },
    {
        tags: ["Tech", "Coding", "Popular"],
        title: "Computer Science\nStarter Pack",
        description: "JetBrains IDEs, GitHub Pro, DigitalOcean credits, and AWS Educate — everything to code like a pro.",
        price: "Save $1,200+",
        cta: "Get the pack",
        bg: "bg-github-purple text-primary-foreground",
        decoration: "dots",
    },
    {
        tags: ["Streaming", "Music", "Gaming"],
        title: "Entertainment\nBundle",
        description: "Spotify, YouTube Premium, Discord Nitro, and Xbox Game Pass — all at student prices.",
        price: "Up to 70% off",
        cta: "Explore deals",
        bg: "bg-spotify-green text-primary-foreground",
        decoration: "circles",
    },
    {
        tags: ["Fashion", "Lifestyle", "Beauty"],
        title: "Fashion &\nApparel Kit",
        description: "Nike, ASOS, Urban Outfitters, and H&M student discounts combined in one place.",
        price: "10–30% off everything",
        cta: "Shop now",
        bg: "bg-pink text-primary-foreground",
        decoration: "zigzag",
    },
    {
        tags: ["Food", "Delivery", "Groceries"],
        title: "Food &\nDining Deals",
        description: "Uber Eats, DoorDash, HelloFresh, and Starbucks — fuel your study sessions for less.",
        price: "Save $50/month",
        cta: "View deals",
        bg: "bg-uber-black text-primary-foreground",
        decoration: "grid",
    },
];

const decorations: Record<string, React.ReactNode> = {
    wave: (
        <div
            className="absolute -bottom-5 -right-5 w-4/5 h-3/5 pointer-events-none opacity-90"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='200' viewBox='0 0 300 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10C50 180 100 180 150 10S250 10 290 190' stroke='white' stroke-width='40' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "bottom right",
            }}
        />
    ),
    dots: (
        <div className="absolute bottom-4 right-4 w-3/5 h-2/5 pointer-events-none opacity-20">
            <svg width="100%" height="100%" viewBox="0 0 200 100">
                {Array.from({ length: 80 }).map((_, i) => (
                    <circle key={i} cx={(i % 10) * 22 + 10} cy={Math.floor(i / 10) * 14 + 5} r="3" fill="white" />
                ))}
            </svg>
        </div>
    ),
    circles: (
        <div className="absolute -bottom-10 -right-10 w-3/5 h-3/5 pointer-events-none opacity-20">
            <svg width="100%" height="100%" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="6" fill="none" />
                <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="4" fill="none" />
                <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="3" fill="none" />
            </svg>
        </div>
    ),
    zigzag: (
        <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-3/5 pointer-events-none opacity-30"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='100' viewBox='0 0 200 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 50C30 20 50 80 70 30C90 70 110 10 130 60C150 20 170 80 190 40' stroke='white' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
            }}
        />
    ),
    grid: (
        <div className="absolute bottom-4 right-4 w-2/5 h-2/5 pointer-events-none opacity-15">
            <svg width="100%" height="100%" viewBox="0 0 100 100">
                {Array.from({ length: 5 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 25} x2="100" y2={i * 25} stroke="white" strokeWidth="1" />
                ))}
                {Array.from({ length: 5 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 25} y1="0" x2={i * 25} y2="100" stroke="white" strokeWidth="1" />
                ))}
            </svg>
        </div>
    ),
};

const FeaturedCarousel = () => {
    const [current, setCurrent] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const goTo = useCallback(
        (index: number) => {
            if (isAnimating) return;
            setIsAnimating(true);
            setCurrent(index);
            setTimeout(() => setIsAnimating(false), 500);
        },
        [isAnimating]
    );

    const next = useCallback(() => {
        goTo((current + 1) % kits.length);
    }, [current, goTo]);

    useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next]);

    const kit = kits[current];
    const isLight = !kit.bg.includes("text-primary-foreground");

    return (
        <article
            className={`col-span-1 sm:col-span-2 rounded-lg overflow-hidden flex flex-col relative p-6 transition-colors duration-500 border-0 shadow-md ${kit.bg}`}
        >
            <div className="flex gap-1.5 mb-4 flex-wrap">
                {kit.tags.map((tag) => (
                    <DealTag key={tag} label={tag} variant={isLight ? "default" : "light"} />
                ))}
            </div>
            <div className="flex flex-col h-full relative z-10">
                <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[0.95] mb-4 whitespace-pre-line">
                    {kit.title}
                </h2>
                <p className={`text-sm max-w-[300px] ${isLight ? "text-foreground/70" : "opacity-85"}`}>
                    {kit.description}
                </p>
                <div className="mt-auto">
                    <span className="text-lg font-semibold leading-tight">{kit.price}</span>
                    <div
                        className={`underline underline-offset-4 text-sm font-medium cursor-pointer mt-3 ${isLight ? "" : "text-primary-foreground"
                            }`}
                    >
                        {kit.cta}
                    </div>
                </div>
            </div>

            {/* Decoration */}
            {decorations[kit.decoration]}

            {/* Dots navigation */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {kits.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current
                                ? isLight
                                    ? "bg-foreground w-5"
                                    : "bg-primary-foreground w-5"
                                : isLight
                                    ? "bg-foreground/30"
                                    : "bg-primary-foreground/40"
                            }`}
                    />
                ))}
            </div>
        </article>
    );
};

export default FeaturedCarousel;
