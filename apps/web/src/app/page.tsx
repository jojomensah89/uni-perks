import { PerkCard } from "@/components/PerkCard";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ArrowRightIcon, Sparkles, TrendingUp } from "lucide-react";
import { CountrySelector } from "@/components/CountrySelector";
import { fetchAPI } from "@/lib/api";
import type { Perk } from "@/types";
import { cn } from "@/lib/utils";
import { CategoryGrid } from "@/components/CategoryGrid";
import { AnimatedShinyText } from "@/components/animated-shiny-text";
import { WordRotate } from "@/components/word-rotate";
export const runtime = "edge";

interface PerksResponse {
  perks: { perk: Perk; category: any }[]; // API returns { perk: ..., category: ... } objects
  meta: any;
}

interface CategoriesResponse {
  categories: any[];
}

export default async function Home() {
  // Parallel fetch: featured perks and categories
  const [featuredRes, categoriesRes] = await Promise.all([
    fetchAPI<PerksResponse>('api/perks?featured=true').catch(() => ({ perks: [], meta: { total: 0 } })),
    fetchAPI<CategoriesResponse>('api/categories').catch(() => ({ categories: [] })),
  ]);

  let perks = featuredRes.perks || [];
  let totalPerks = featuredRes.meta?.total || 100;
  const categories = categoriesRes.categories || [];

  // Fallback to latest if no featured
  if (perks.length === 0) {
    const latest = await fetchAPI<PerksResponse>('api/perks?limit=6').catch(() => ({ perks: [] }));
    perks = latest.perks?.slice(0, 3) || [];
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Premium Hero Section */}
      <section className="relative px-4 pt-20 pb-16 text-center md:pt-32 md:pb-24 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="absolute inset-0 -z-10 bg-[url('/grid.svg')] opacity-20" />

        <div className="container mx-auto max-w-5xl space-y-8 relative">
          {/* Badge */}
          <div
            className={cn(
              "group w-fit mx-auto rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            )}
          >

            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
              <span>✨ Over {totalPerks}+ verified student discounts</span>
              <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
            </AnimatedShinyText>
          </div>

          {/* Heading */}
          <h1 className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 text-6xl font-bold tracking-tighter sm:text-7xl md:text-8xl bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
            Student <WordRotate className="text-primary bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent" words={["Perks,", "Discounts,", "Offers,", "Deals,", "Freebies,"]} /> <br />
            <span>Reimagined.</span>
          </h1>

          {/* Subtext */}
          <p className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Unlock thousands of dollars in free software, lifestyle discounts, and exclusive offers.
            Verified for students worldwide.
          </p>

          {/* Actions */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400 flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link
              href={"/perks" as any}
              className={cn(buttonVariants({ size: "xl" }), "h-14 px-8 text-lg rounded-full shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)] hover:shadow-[0_0_60px_-10px_rgba(var(--primary),0.4)] transition-all")}
            >
              Browse Perks
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Perks */}
      <section className="container mx-auto px-4 py-12 space-y-12">
        <div className="flex items-center justify-between border-b pb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Featured Perks</h2>
            <p className="text-muted-foreground">Hand-picked offers trending right now</p>
          </div>
          <Link
            href={"/perks" as any}
            className={cn(buttonVariants({ variant: "ghost" }), "group")}
          >
            View All
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {perks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {perks.map(({ perk }) => (
              <div key={perk.id} className="transition-all hover:-translate-y-1">
                <PerkCard perk={perk} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-muted/5">
            <p className="text-muted-foreground">No featured perks available at the moment.</p>
          </div>
        )}
      </section>

      {/* Categories Grid */}
      <CategoryGrid categories={categories} />
    </div>
  );
}
