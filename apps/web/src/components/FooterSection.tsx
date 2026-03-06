"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import { toast } from "sonner";
import { TurnstileWidget } from "@/components/TurnstileWidget";

type ApiCategoryResponse = {
    id: string;
    name: string;
    slug: string;
};

export const FooterSection = () => {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    // Fetch categories from API
    const { data: categoriesData } = useQuery({
        queryKey: ["footer-categories"],
        queryFn: () => fetchAPI<{ categories: ApiCategoryResponse[] }>("/api/categories?limit=5"),
    });

    // Fetch deal count from API
    const { data: dealsData } = useQuery({
        queryKey: ["footer-deal-count"],
        queryFn: () => fetchAPI<{ meta: { total: number } }>("/api/deals?limit=1"),
    });

    const categories = categoriesData?.categories || [];
    const dealCount = dealsData?.meta?.total || 0;

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsSubmitting(true);
        try {
            await fetchAPI("/api/newsletter/subscribe", {
                method: "POST",
                body: JSON.stringify({
                    email: email.trim(),
                    source: "footer",
                    turnstileToken,
                }),
            });
            setSubscribed(true);
            setEmail("");
            toast.success("Check your inbox to confirm your subscription.");
        } catch (error: any) {
            toast.error(error?.message || "Failed to subscribe. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className="mt-auto">
            {/* Newsletter CTA - Green gradient using primary color */}
            <div className="bg-gradient-to-r from-primary to-primary/80 px-6 md:px-10 py-12 md:py-16 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Don&apos;t miss the next drop
                </h2>
                <p className="text-base text-white/90 mb-6">
                    Join 50,000+ students saving money every day.
                </p>
                {subscribed ? (
                    <p className="text-sm font-semibold text-white bg-white/20 inline-block px-6 py-3 rounded-full">
                        You&apos;re in! Check your inbox.
                    </p>
                ) : (
                    <form onSubmit={handleSubscribe} className="max-w-lg mx-auto space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="What's your uni email?"
                                required
                                className="flex-1 bg-white rounded-lg px-6 py-4 text-sm outline-none placeholder:text-muted-foreground"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting || (!!turnstileSiteKey && !turnstileToken)}
                                className="bg-foreground disabled:opacity-60 text-primary-foreground px-8 py-4 rounded-lg text-sm font-semibold hover:bg-foreground/90 transition-opacity whitespace-nowrap"
                            >
                                {isSubmitting ? "Subscribing..." : "Subscribe"}
                            </button>
                        </div>
                        <TurnstileWidget siteKey={turnstileSiteKey} onTokenChange={setTurnstileToken} />
                    </form>
                )}
                <p className="text-xs text-white/70 mt-4">
                    No spam. Unsubscribe anytime. We respect your inbox.
                </p>
            </div>

            {/* Footer links */}
            <div className="bg-foreground text-primary-foreground px-6 md:px-10 py-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Column */}
                    <div>
                        <h3 className="font-bold text-2xl mb-3">
                            UniPerks
                        </h3>
                        <p className="text-sm text-primary-foreground/60 leading-relaxed mb-6">
                            The best student discounts. Zero signup.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-lg hover:bg-white/20 transition-colors no-underline">
                                📱
                            </a>
                            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-lg hover:bg-white/20 transition-colors no-underline">
                                🐦
                            </a>
                            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-lg hover:bg-white/20 transition-colors no-underline">
                                📷
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">Quick Links</h4>
                        <div className="flex flex-col gap-3">
                            <Link href="/browse" className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors">Browse Deals</Link>
                            <Link href="/about" className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors">About Us</Link>
                            <Link href="/admin" className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors">Admin</Link>
                            <Link href="#" className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors">Contact</Link>
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">Categories</h4>
                        <div className="flex flex-col gap-3">
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/categories/${cat.slug}` as any}
                                        className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                ))
                            ) : (
                                <>
                                    <Link href={"/categories/tech-software" as any} className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors">Tech & Software</Link>
                                    <Link href={"/categories/fashion" as any} className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors">Fashion</Link>
                                    <Link href={"/categories/food-delivery" as any} className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors">Food & Delivery</Link>
                                    <Link href={"/categories/travel" as any} className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors">Travel</Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">Legal</h4>
                        <div className="flex flex-col gap-3">
                            <Link href="#" className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors">Terms of Service</Link>
                            <Link href="#" className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors">Privacy Policy</Link>
                            <Link href="#" className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors">Cookie Policy</Link>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-primary-foreground/10 text-center">
                    <p className="text-xs text-primary-foreground/40 mb-2">
                        &copy; {new Date().getFullYear()} UniPerks. All rights reserved.
                    </p>
                    <p className="text-xs text-primary-foreground/40">
                        Made with ☕ for broke students. {dealCount > 0 && `${dealCount} verified deals.`}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;
