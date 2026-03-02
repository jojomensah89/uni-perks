"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

interface TickerSettings {
    messages: string[];
}

// Default fallback messages
const DEFAULT_MESSAGES = [
    "UNI-PERKS",
    "NO SIGNUP",
    "100% VERIFIED",
    "STUDENT DEALS",
    "NO BS",
];

const TickerBar = () => {
    const { data } = useQuery({
        queryKey: ["ticker_settings"],
        queryFn: () => fetchAPI<TickerSettings>("/api/settings/ticker"),
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    const messages = data?.messages || DEFAULT_MESSAGES;
    const tickerText = messages.join(" /// ") + " /// ";

    return (
        <div className="bg-foreground py-2 overflow-hidden">
            <div className="animate-[ticker_30s_linear_infinite] whitespace-nowrap font-mono text-xs uppercase tracking-widest text-primary">
                <span className="inline-block">
                    {tickerText.repeat(4)}
                </span>
            </div>
        </div>
    );
};

export default TickerBar;
