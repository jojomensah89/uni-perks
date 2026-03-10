"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

interface TickerSettings {
    messages: string[];
}

// Matches the actual API response shape from deal.repository.ts
interface ApiDeal {
    deal: {
        id: string;
        discountLabel: string;
    };
    brand: {
        name: string;
    };
}

// Default fallback messages (mimicking yellow page ticker style: STORE — DISCOUNT)
const DEFAULT_ITEMS = [
    { store: "Gymshark", discount: "15% OFF" },
    { store: "Spotify", discount: "50% OFF" },
    { store: "ASOS", discount: "10% OFF" },
    { store: "Apple", discount: "£150 OFF" },
    { store: "Adobe", discount: "60% OFF" },
    { store: "Railcard", discount: "30% OFF" },
    { store: "Amazon", discount: "FREE" },
    { store: "Deliveroo", discount: "FREE" },
    { store: "Notion", discount: "FREE" },
    { store: "Nike", discount: "20% OFF" },
];

const TickerBar = () => {
    const { data: settingsData } = useQuery({
        queryKey: ["ticker_settings"],
        queryFn: () => fetchAPI<TickerSettings>("/api/settings/ticker"),
        staleTime: 1000 * 60 * 5,
    });

    const { data: dealsData } = useQuery({
        queryKey: ["ticker-deals"],
        queryFn: () => fetchAPI<{ deals: ApiDeal[] }>("/api/deals?limit=12&sort=featured"),
        staleTime: 1000 * 60 * 5,
    });

    // Build ticker items: prefer deals from API, fall back to static defaults
    const deals = dealsData?.deals;
    const tickerItems: { store: string; discount: string }[] =
        deals && deals.length > 0
            ? deals.map((d) => ({
                store: d.brand.name,
                discount: d.deal.discountLabel,
            }))
            : DEFAULT_ITEMS;

    // If custom messages exist from settings, use them as text items instead
    const customMessages = settingsData?.messages;

    return (
        <div className="overflow-hidden border-t border-b border-border bg-primary/[0.04]">
            <div
                className="flex py-2"
                style={{
                    animation: "ticker 35s linear infinite",
                    whiteSpace: "nowrap",
                }}
            >
                <style>{`
                    @keyframes ticker {
                        from { transform: translateX(0); }
                        to { transform: translateX(-50%); }
                    }
                `}</style>

                {/* Render items twice for seamless loop */}
                {[0, 1].map((ri) => (
                    <span key={ri} className="inline-flex">
                        {customMessages && customMessages.length > 0
                            ? customMessages.map((msg, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-2 px-7 text-[10px] font-bold font-mono tracking-[0.08em] uppercase text-muted-foreground"
                                >
                                    <span className="text-primary">↗</span>
                                    {msg}
                                </span>
                            ))
                            : tickerItems.map((item, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-2 px-7 text-[10px] font-bold font-mono tracking-[0.08em] uppercase text-muted-foreground"
                                >
                                    <span className="text-primary">↗</span>
                                    {item.store} — {item.discount}
                                </span>
                            ))}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default TickerBar;
