import Link from "next/link";
import { ShieldCheck, Search, Zap, Heart, ArrowRight } from "lucide-react";
import { allDeals, categories } from "@/data/deals";

const steps = [
    {
        icon: Search,
        title: "Browse",
        description: "Search or browse 30+ verified student perks across software, food, fashion, travel, and more.",
    },
    {
        icon: ShieldCheck,
        title: "Verify",
        description: "Each perk lists the verification method — .edu email, SheerID, UNiDAYS, or student ID.",
    },
    {
        icon: Zap,
        title: "Claim",
        description: "Follow the step-by-step instructions to claim your discount. Most activate instantly.",
    },
    {
        icon: Heart,
        title: "Save",
        description: "Students save an average of $2,000+ per year using perks like these. Start saving today.",
    },
];

const faqs = [
    {
        q: "Is UniPerks free to use?",
        a: "Yes, completely free. We earn a small commission from some affiliate links, but it never costs you extra.",
    },
    {
        q: "How do I verify my student status?",
        a: "Each perk has its own verification method listed. Most common methods are .edu email, SheerID, UNiDAYS, or uploading a student ID.",
    },
    {
        q: "How often are perks updated?",
        a: "We verify and update our perk listings regularly. If a perk expires or changes, we update it as soon as possible.",
    },
    {
        q: "Can I submit a perk I found?",
        a: "Absolutely! Use our Submit a Perk page to share deals we might have missed. Community contributions help everyone.",
    },
    {
        q: "Do these work for international students?",
        a: "Many perks are available worldwide. Each listing shows regional availability so you can check before claiming.",
    },
];

export const metadata = {
    title: "How It Works",
    description: "Learn how UniPerks works — browse, verify, and claim the best student discounts.",
};

export default function AboutPage() {
    return (
        <div className="max-w-[1440px] mx-auto bg-background min-h-screen flex flex-col">
            {/* Hero */}
            <section className="px-4 md:px-6 py-16 md:py-20 text-center">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                    How UniPerks Works
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto mb-2">
                    We aggregate the best student perks, discounts, and freebies in one place — so you don&apos;t have to hunt for them.
                </p>
                <p className="text-sm text-muted-foreground">
                    Currently tracking <strong className="text-foreground">{allDeals.length}+ perks</strong> across{" "}
                    <strong className="text-foreground">{categories.length} categories</strong>.
                </p>
            </section>

            {/* Steps */}
            <section className="px-4 md:px-6 pb-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1000px] mx-auto">
                    {steps.map((step, i) => (
                        <div key={step.title} className="relative text-center p-6">
                            <div className="bg-[hsl(65,100%,60%)] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <step.icon className="w-6 h-6 text-foreground" />
                            </div>
                            <div className="absolute top-2 left-2 text-6xl font-black text-foreground/5">{i + 1}</div>
                            <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories overview */}
            <section className="px-4 md:px-6 py-12 bg-muted">
                <h2 className="text-xl font-bold text-center mb-8">Perk Categories</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-[800px] mx-auto">
                    {categories.map((cat) => {
                        const count = allDeals.filter((d) => d.category === cat).length;
                        return (
                            <Link
                                key={cat}
                                href={`/browse?cat=${encodeURIComponent(cat)}`}
                                className="bg-card rounded-xl p-4 text-center no-underline hover:shadow-md transition-shadow border border-border"
                            >
                                <p className="font-semibold text-sm text-foreground">{cat}</p>
                                <p className="text-xs text-muted-foreground mt-1">{count} perks</p>
                            </Link>
                        );
                    })}
                </div>
                <div className="text-center mt-6">
                    <Link
                        href="/browse"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-pill text-sm font-medium no-underline hover:opacity-80 transition-opacity"
                    >
                        Browse all deals
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* FAQ */}
            <section className="px-4 md:px-6 py-16">
                <h2 className="text-xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                <div className="max-w-[700px] mx-auto space-y-4">
                    {faqs.map((faq) => (
                        <div key={faq.q} className="bg-card rounded-xl p-5 border border-border">
                            <h3 className="font-semibold text-sm mb-2">{faq.q}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Affiliate disclosure */}
            <section className="px-4 md:px-6 py-8 bg-muted">
                <div className="max-w-[700px] mx-auto text-center">
                    <h3 className="font-semibold text-sm mb-2">Affiliate Disclosure</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        UniPerks contains affiliate links. When you click on a link and make a purchase or sign up for a service,
                        we may earn a small commission at no extra cost to you. This helps us keep the site running and
                        continue curating the best student perks.
                    </p>
                </div>
            </section>
        </div>
    );
}
