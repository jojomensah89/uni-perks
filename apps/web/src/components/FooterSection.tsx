"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import { toast } from "sonner";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type ApiCategoryResponse = {
    id: string;
    name: string;
    slug: string;
};

// Static footer link structure inspired by yellow page prototype
const FOOTER_LINKS = {
    Explore: [
        { label: "All Deals", href: "/browse" },
        { label: "Featured", href: "/browse?featured=true" },
        { label: "New Arrivals", href: "/browse?sort=new" },
        { label: "Expiring Soon", href: "/browse?sort=expiring" },
        { label: "Free Deals", href: "/browse?type=free" },
        { label: "Student Picks", href: "/browse?collection=student-picks" },
    ],
    Students: [
        { label: "How It Works", href: "/how-it-works" },
        { label: "Verify Student Status", href: "/verify" },
        { label: "Submit a Deal", href: "/submit" },
        { label: "Student Blog", href: "/blog" },
        { label: "University Hubs", href: "/universities" },
        { label: "Partner With Us", href: "/partners" },
    ],
    Company: [
        { label: "About UniPerks", href: "/about" },
        { label: "Press & Media", href: "/press" },
        { label: "Careers", href: "/careers" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Contact Us", href: "/contact" },
    ],
};

export const FooterSection = () => {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    // Fetch categories from API for the dynamic categories column
    const { data: categoriesData } = useQuery({
        queryKey: ["footer-categories"],
        queryFn: () => fetchAPI<{ categories: ApiCategoryResponse[] }>("/api/categories?limit=6"),
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
            {/* ── Newsletter CTA ── */}
            <div className="border-t border-b border-border bg-primary/5 px-6 md:px-10 py-12 md:py-16">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
                    {/* Left: copy */}
                    <div className="flex-none max-w-sm text-center md:text-left">
                        <p className="text-xs font-bold tracking-[0.14em] uppercase text-primary mb-2">
                            Newsletter
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-3">
                            Never miss a{" "}
                            <span className="text-primary">student deal</span>
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Get the best verified deals delivered to your inbox every week. No spam, just savings.
                        </p>
                    </div>

                    {/* Right: form */}
                    <div className="flex-1 min-w-0 w-full max-w-lg">
                        {subscribed ? (
                            <div className="border-2 border-primary p-6 text-center rounded-lg">
                                <p className="text-xl font-black uppercase text-primary mb-1">
                                    You&apos;re in! ★
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Check your inbox for a confirmation.
                                </p>
                            </div>
                        ) : (
                            <>
                                <form onSubmit={handleSubscribe} className="flex gap-2 mb-3">
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@university.ac.uk"
                                        required
                                        className="flex-1 h-12"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || (!!turnstileSiteKey && !turnstileToken)}
                                        className="h-12 px-6 font-bold uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {isSubmitting ? "Subscribing..." : "Subscribe"}
                                    </Button>
                                </form>
                                <TurnstileWidget siteKey={turnstileSiteKey} onTokenChange={setTurnstileToken} />
                                <p className="text-xs text-muted-foreground tracking-wide">
                                    ✓ Weekly digest &nbsp;·&nbsp; ✓ Expiry alerts &nbsp;·&nbsp; ✓ Exclusive drops
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Footer Links ── */}
            <div className="bg-foreground text-primary-foreground px-6 md:px-10 py-12">
                <div className="max-w-7xl mx-auto">
                    {/* 5-col grid: brand + Explore + Categories + Students + Company */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
                        {/* Brand Column */}
                        <div className="col-span-2 md:col-span-1">
                            <h3 className="font-black text-2xl mb-3 text-primary">UniPerks</h3>
                            <p className="text-sm text-primary-foreground/60 leading-relaxed mb-6 max-w-[200px]">
                                The search engine for student deals. Verified, curated, and always up to date.
                            </p>
                            <div className="flex gap-3">
                                {[
                                    { label: "TW", href: "https://twitter.com" },
                                    { label: "IG", href: "https://instagram.com" },
                                    { label: "TK", href: "https://tiktok.com" },
                                    { label: "LI", href: "https://linkedin.com" },
                                ].map((s) => (
                                    <a
                                        key={s.label}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-foreground/10 text-xs font-bold font-mono text-primary-foreground/60 hover:bg-primary/20 hover:text-primary transition-colors no-underline"
                                        aria-label={s.label}
                                    >
                                        {s.label}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Explore */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-primary mb-4">
                                Explore
                            </h4>
                            <nav className="flex flex-col gap-2">
                                {FOOTER_LINKS.Explore.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href as any}
                                        className="text-sm text-primary-foreground/60 hover:text-primary transition-colors no-underline"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Categories (dynamic from API) */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-primary mb-4">
                                Categories
                            </h4>
                            <nav className="flex flex-col gap-2">
                                {categories.length > 0 ? (
                                    categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            href={`/categories/${cat.slug}` as any}
                                            className="text-sm text-primary-foreground/60 hover:text-primary transition-colors no-underline"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))
                                ) : (
                                    <>
                                        <Link href={"/categories/tech-software" as any} className="text-sm text-primary-foreground/60 hover:text-primary transition-colors no-underline">Tech & Software</Link>
                                        <Link href={"/categories/fashion" as any} className="text-sm text-primary-foreground/60 hover:text-primary transition-colors no-underline">Fashion</Link>
                                        <Link href={"/categories/food-delivery" as any} className="text-sm text-primary-foreground/60 hover:text-primary transition-colors no-underline">Food & Drink</Link>
                                        <Link href={"/categories/travel" as any} className="text-sm text-primary-foreground/60 hover:text-primary transition-colors no-underline">Travel</Link>
                                        <Link href={"/categories/entertainment" as any} className="text-sm text-primary-foreground/60 hover:text-primary transition-colors no-underline">Entertainment</Link>
                                        <Link href={"/categories/health-wellness" as any} className="text-sm text-primary-foreground/60 hover:text-primary transition-colors no-underline">Health & Wellness</Link>
                                    </>
                                )}
                            </nav>
                        </div>

                        {/* Students */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-primary mb-4">
                                Students
                            </h4>
                            <nav className="flex flex-col gap-2">
                                {FOOTER_LINKS.Students.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href as any}
                                        className="text-sm text-primary-foreground/60 hover:text-primary transition-colors no-underline"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-primary mb-4">
                                Company
                            </h4>
                            <nav className="flex flex-col gap-2">
                                {FOOTER_LINKS.Company.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href as any}
                                        className="text-sm text-primary-foreground/60 hover:text-primary transition-colors no-underline"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <Separator className="bg-primary-foreground/10 mb-6" />
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-primary-foreground/40 uppercase tracking-wider font-mono">
                            © {new Date().getFullYear()} UniPerks · All deals verified
                            {dealCount > 0 && ` · ${dealCount} active deals`}
                        </p>
                        <div className="flex gap-6">
                            {[
                                { label: "Privacy Policy", href: "/privacy" },
                                { label: "Terms of Service", href: "/terms" },
                                { label: "Cookie Settings", href: "/cookies" },
                            ].map((l) => (
                                <Link
                                    key={l.label}
                                    href={l.href as any}
                                    className="text-xs text-primary-foreground/40 hover:text-primary uppercase tracking-wider font-mono transition-colors no-underline"
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;
