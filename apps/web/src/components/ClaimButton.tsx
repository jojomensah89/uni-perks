"use client";

import { buttonVariants } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTrackClick } from "@/hooks/use-track-click";

interface ClaimButtonProps {
    perkId: string;
    claimUrl: string;
    available: boolean;
}

export function ClaimButton({ perkId, claimUrl, available }: ClaimButtonProps) {
    const { trackClick } = useTrackClick({ perkId });

    const handleClick = async (e: React.MouseEvent) => {
        // Track the click
        await trackClick();
        // Let the link navigate naturally
    };

    return (
        <a
            href={claimUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
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
