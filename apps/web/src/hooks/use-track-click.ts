"use client";

import { useEffect } from "react";

interface TrackClickProps {
    perkId: string;
    onTrack?: () => void;
}

/**
 * Client component to track perk clicks
 * Wraps the "Get Deal" button to send click event to API
 */
export function useTrackClick({ perkId, onTrack }: TrackClickProps) {
    const trackClick = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/clicks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ perkId }),
            });
            onTrack?.();
        } catch (error) {
            console.error('Failed to track click:', error);
            // Don't block the user from navigating even if tracking fails
        }
    };

    return { trackClick };
}
