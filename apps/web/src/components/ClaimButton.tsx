"use client";

import { buttonVariants } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClaimButtonProps {
    perkSlug: string;
    source?: "card" | "detail" | "featured" | "collection" | "newsletter" | "comparison" | "persona";
    available: boolean;
}
export function ClaimButton({ perkSlug, source = "detail", available }: ClaimButtonProps) {
    const serverOrigin = process.env.NEXT_PUBLIC_SERVER_URL;
    const claimPath = `/go/${perkSlug}?src=${source}`;
    const href = serverOrigin ? new URL(claimPath, serverOrigin).toString() : claimPath;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                buttonVariants({
                    size: "lg",
                    variant: available ? "default" : "secondary"
                }),
                "w-full gap-2"
            )}
        >
            Get Deal
            <ExternalLink className="w-4 h-4" />
        </a>
    );
}
