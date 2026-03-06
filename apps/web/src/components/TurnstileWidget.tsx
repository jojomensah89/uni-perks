"use client";

import { useEffect, useRef } from "react";

declare global {
    interface Window {
        turnstile?: {
            render: (container: HTMLElement, options: Record<string, unknown>) => string;
            remove: (widgetId: string) => void;
        };
    }
}

async function ensureTurnstileScript() {
    if (typeof window === "undefined") return;
    if (window.turnstile) return;

    const existing = document.querySelector<HTMLScriptElement>('script[src*="challenges.cloudflare.com/turnstile"]');
    if (existing) {
        await new Promise<void>((resolve) => {
            if (window.turnstile) resolve();
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => resolve(), { once: true });
        });
        return;
    }

    await new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
    });
}

interface TurnstileWidgetProps {
    siteKey?: string;
    onTokenChange: (token: string | null) => void;
}

export function TurnstileWidget({ siteKey, onTokenChange }: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!siteKey || !containerRef.current) return;

        let isMounted = true;

        void (async () => {
            await ensureTurnstileScript();
            if (!isMounted || !containerRef.current || !window.turnstile) return;

            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                callback: (token: string) => onTokenChange(token),
                "expired-callback": () => onTokenChange(null),
                "error-callback": () => onTokenChange(null),
            });
        })();

        return () => {
            isMounted = false;
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
            }
        };
    }, [siteKey, onTokenChange]);

    if (!siteKey) return null;
    return <div ref={containerRef} />;
}
