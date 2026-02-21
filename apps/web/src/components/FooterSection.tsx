"use client";

import { useState } from "react";
import Link from "next/link";
import { allDeals, categories } from "@/data/deals";

export const FooterSection = () => {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail("");
        }
    };

    return (
        <footer className="mt-auto">
            {/*Newsletter CTA*/}
            <div className="bg-primary px-6 md:px-10 py-10 text-center flex flex-col items-center gap-4">
                <h2 className="text-xl font-bold leading-tight text-foreground">Don&apos;t miss new student perks</h2>
                <p className="text-sm text-foreground/70">
                    Join 50,000+ students saving money every day. Weekly digest of the best deals.
                </p>
                {subscribed ? (
                    <p className="text-sm font-semibold text-foreground mt-2">You&apos;re in! Check your inbox.</p>
                ) : (
                    <form onSubmit={handleSubscribe} className="flex gap-3 mt-4 max-w-[500px] w-full">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@university.edu"
                            required
                            className="flex-1 bg-white/80 border border-foreground/20 rounded-pill px-6 py-3 text-sm outline-none placeholder:text-foreground/40 focus:ring-2 focus:ring-foreground/20"
                        />
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground px-5 py-3 rounded-pill text-sm font-medium hover:opacity-80 transition-opacity whitespace-nowrap"
                        >
                            Subscribe
                        </button>
                    </form>
                )}
            </div>

            {/* Footer links */}
            <div className="bg-foreground text-primary-foreground px-6 md:px-10 py-10">
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-sm">U</span>
                            UniPerks
                        </h3>
                        <p className="text-sm text-primary-foreground/60 leading-relaxed">
                            The best student discounts, perks, and freebies. Verified and updated regularly.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-primary-foreground/80">Navigation</h4>
                        <div className="flex flex-col gap-2">
                            <Link href="/" className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors">Home</Link>
                            <Link href="/browse" className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors">Browse Deals</Link>
                            <Link href="/about" className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors">How It Works</Link>
                            <Link href="#" className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors">Submit a Perk</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-primary-foreground/80">Categories</h4>
                        <div className="flex flex-col gap-2">
                            {categories.slice(0, 5).map((cat) => (
                                <Link
                                    key={cat}
                                    href={`/browse?cat=${encodeURIComponent(cat)}`}
                                    className="text-sm text-primary-foreground/60 hover:text-primary-foreground no-underline transition-colors"
                                >
                                    {cat}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-primary-foreground/80">Stats</h4>
                        <div className="space-y-2 text-sm text-primary-foreground/60">
                            <p>{allDeals.length}+ verified perks</p>
                            <p>{categories.length} categories</p>
                            <p>Updated daily</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1200px] mx-auto mt-8 pt-6 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-primary-foreground/40">
                        &copy; {new Date().getFullYear()} UniPerks. This site contains affiliate links.
                    </p>
                    <p className="text-xs text-primary-foreground/40">
                        Perks are subject to change. Always verify on the company&apos;s website.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;
