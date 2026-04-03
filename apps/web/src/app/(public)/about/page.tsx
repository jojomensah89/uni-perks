import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Zap,
  Heart,
  ArrowRight,
  ChevronRight,
  Tag,
  BadgeCheck,
  HandCoins,
} from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { AboutFaqAccordion } from "@/components/about/AboutFaqAccordion";

type ApiCategoryResponse = {
  id: string;
  name: string;
  slug: string;
};

type CategoryWithCount = ApiCategoryResponse & { dealCount: number };

const steps = [
  {
    icon: Search,
    title: "Browse",
    description:
      "Search or browse verified student deals across software, food, fashion, travel, and more.",
  },
  {
    icon: ShieldCheck,
    title: "Verify",
    description:
      "Each deal lists the verification method - .edu email, SheerID, UNiDAYS, or student ID.",
  },
  {
    icon: Zap,
    title: "Claim",
    description:
      "Follow the step-by-step instructions to claim your discount. Most activate instantly.",
  },
  {
    icon: Heart,
    title: "Save",
    description:
      "Students save an average of $2,000+ per year using deals like these. Start saving today.",
  },
];

const faqs = [
  {
    q: "Is UniPerks free to use?",
    a: "Yes, completely free. We earn a small commission from some affiliate links, but it never costs you extra.",
  },
  {
    q: "How do I verify my student status?",
    a: "Each deal has its own verification method listed. Most common methods are .edu email, SheerID, UNiDAYS, or uploading a student ID.",
  },
  {
    q: "How often are deals updated?",
    a: "We verify and update our deal listings regularly. If a deal expires or changes, we update it as soon as possible.",
  },
  {
    q: "Can I submit a deal I found?",
    a: "Absolutely! We welcome community contributions to help everyone save more.",
  },
  {
    q: "Do these work for international students?",
    a: "Many deals are available worldwide. Each listing shows regional availability so you can check before claiming.",
  },
];

export const metadata = {
  title: "How It Works",
  description:
    "Learn how UniPerks works - browse, verify, and claim the best student discounts.",
};

const categoryIconBySlug: Record<string, typeof Tag> = {
  "tech-software": Tag,
  fashion: Tag,
  "food-delivery": Tag,
  travel: Tag,
  entertainment: Tag,
  "health-wellness": Tag,
  "education-learning": Tag,
  "sports-outdoors": Tag,
};

export default async function AboutPage() {
  const [dealsRes, categoriesRes] = await Promise.all([
    fetchAPI<{ meta: { total: number } }>("/api/deals?limit=1"),
    fetchAPI<{ categories: ApiCategoryResponse[] }>("/api/categories?limit=8"),
  ]);

  const totalDeals = dealsRes.meta?.total || 0;
  const categories = categoriesRes.categories || [];

  const categoriesWithCounts: CategoryWithCount[] = await Promise.all(
    categories.map(async (cat) => {
      try {
        const catDealsRes = await fetchAPI<{ meta: { total: number } }>(
          `/api/deals?category=${cat.slug}&limit=1`,
        );
        return { ...cat, dealCount: catDealsRes.meta?.total || 0 };
      } catch {
        return { ...cat, dealCount: 0 };
      }
    }),
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col bg-background">
      <section className="px-4 py-16 text-center md:px-6 md:py-20">
        <h1 className="mb-4 text-3xl font-black tracking-tight md:text-5xl">
          How UniPerks Works
        </h1>
        <p className="mx-auto mb-2 max-w-lg text-muted-foreground">
          We aggregate the best student deals, discounts, and freebies in one
          place - so you do not have to hunt for them.
        </p>
        <p className="text-sm text-muted-foreground">
          Currently tracking <strong className="text-foreground">{totalDeals}+ deals</strong> across{" "}
          <strong className="text-foreground">{categories.length} categories</strong>.
        </p>
      </section>

      <section className="px-4 pb-16 md:px-6">
        <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary">
                <step.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="absolute left-2 top-2 text-6xl font-black text-foreground/5">
                {i + 1}
              </div>
              <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 px-4 py-14 md:px-6">
        <div className="mx-auto max-w-[1100px] rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm md:p-10">
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              Explore
            </p>
            <h2 className="mb-2 text-2xl font-black tracking-tight md:text-3xl">
              Deal Categories
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
              Jump into the categories students use most and see live deal counts
              before you click in.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoriesWithCounts
              .filter((cat) => cat.dealCount > 0)
              .map((cat) => {
                const Icon = categoryIconBySlug[cat.slug] || Tag;
                return (
                  <Link
                    key={cat.id}
                    href={`/browse?cat=${encodeURIComponent(cat.slug)}`}
                    className="group rounded-xl border border-border bg-background p-4 no-underline transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </div>
                    <p className="font-semibold text-foreground">{cat.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {cat.dealCount} active deals
                    </p>
                  </Link>
                );
              })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition-all hover:bg-primary/90"
            >
              Browse all deals
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-6">
        <h2 className="mb-8 text-center text-xl font-bold">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto max-w-[760px] rounded-2xl border border-border bg-card p-4 md:p-6">
          <AboutFaqAccordion items={faqs} />
        </div>
      </section>

      <section className="bg-muted/30 px-4 py-10 md:px-6">
        <div className="mx-auto max-w-[900px] rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                Transparency
              </p>
              <h3 className="text-xl font-black tracking-tight md:text-2xl">
                Affiliate Disclosure
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                UniPerks contains affiliate links. If you claim a deal and complete
                a purchase or signup, we may earn a small commission at no extra
                cost to you.
              </p>
            </div>
            <div className="shrink-0 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-xs text-muted-foreground">Our promise</p>
              <p className="text-sm font-semibold text-foreground">
                No extra cost to students
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Independent curation
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                We prioritize value and legitimacy first, and label promotional
                content clearly.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
                <HandCoins className="h-4 w-4 text-primary" />
                Why it exists
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Commissions help fund hosting, verification work, and continuous
                updates to active deals.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
