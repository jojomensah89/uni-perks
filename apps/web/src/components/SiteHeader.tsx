"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";

export const SiteHeader = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <header className="px-4 md:px-6 py-4 flex justify-between items-center border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
            <Link href="/" className="text-xl font-black tracking-[-0.04em] no-underline text-foreground flex items-center gap-2">
                <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-md text-lg">U</span>
                UniPerks
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex gap-1 items-center">
                <Link
                    href="/"
                    className={`px-3 py-2 rounded-full text-sm no-underline transition-colors ${isActive("/") ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Home
                </Link>
                <Link
                    href="/browse"
                    className={`px-3 py-2 rounded-full text-sm no-underline transition-colors ${isActive("/browse") ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Browse
                </Link>
                <Link
                    href="/about"
                    className={`px-3 py-2 rounded-full text-sm no-underline transition-colors ${isActive("/about") ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    How It Works
                </Link>
                <a
                    href="/submit"
                    className={`px-3 py-2 rounded-full text-sm no-underline transition-colors ${isActive("/submit") ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Submit a Perk
                </a>
                <div className="w-px h-5 bg-border mx-2" />
                <Link
                    href="/browse"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium no-underline hover:opacity-80 transition-opacity flex items-center gap-2"
                >
                    <Search className="w-3.5 h-3.5" />
                    Search deals
                </Link>
            </nav>

            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="absolute top-full left-0 right-0 bg-background border-b border-border z-50 p-4 flex flex-col gap-1 md:hidden shadow-lg">
                    <Link
                        href="/"
                        onClick={() => setMobileOpen(false)}
                        className={`px-4 py-3 rounded-lg text-sm no-underline transition-colors ${isActive("/") ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Home
                    </Link>
                    <Link
                        href="/browse"
                        onClick={() => setMobileOpen(false)}
                        className={`px-4 py-3 rounded-lg text-sm no-underline transition-colors ${isActive("/browse") ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Browse All Deals
                    </Link>
                    <Link
                        href="/about"
                        onClick={() => setMobileOpen(false)}
                        className={`px-4 py-3 rounded-lg text-sm no-underline transition-colors ${isActive("/about") ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        How It Works
                    </Link>
                    <a
                        href="/submit"
                        onClick={() => setMobileOpen(false)}
                        className={`px-4 py-3 rounded-lg text-sm no-underline transition-colors ${isActive("/submit") ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Submit a Perk
                    </a>
                </div>
            )}
        </header>
    );
};

export default SiteHeader;
