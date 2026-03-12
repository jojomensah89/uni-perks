"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { FooterSection } from "@/components/FooterSection";
import TickerBar from "@/components/TickerBar";
import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const posthog = usePostHog();

    useEffect(() => {
        posthog?.capture("$pageview", { $current_url: window.location.href });
    }, [pathname, searchParams, posthog]);
    return (
        <>
            <div className="sticky top-0 z-50">
                <SiteHeader />
                <TickerBar />
            </div>
            <main>{children}</main>
            <FooterSection />
        </>
    );
}
