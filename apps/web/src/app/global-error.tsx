"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Report critical error
        console.error("Critical error caught by GlobalError:", error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                    <div className="bg-destructive/10 text-destructive rounded-full p-4 mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-10 h-10"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Critical Error</h1>
                    <p className="text-muted-foreground mb-8 max-w-md">
                        We're sorry. We've encountered a critical error preventing the application from loading.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button onClick={() => reset()} size="lg">
                            Try again
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => (window.location.href = "/")}>
                            Return Home
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    );
}
