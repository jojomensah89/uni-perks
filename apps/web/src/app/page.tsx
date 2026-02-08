import { PerkCard } from "@/components/PerkCard";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { CountrySelector } from "@/components/CountrySelector";
import { fetchAPI } from "@/lib/api";
import type { Perk } from "@/types";
import { cn } from "@/lib/utils";

export const runtime = "edge";

interface PerksResponse {
  perks: { perk: Perk; category: any }[]; // API returns { perk: ..., category: ... } objects
  meta: any;
}

export default async function Home() {
  // Fetch featured perks
  // We need to handle potential failures gracefully
  let perks: { perk: Perk }[] = [];
  let totalPerks = 0;

  try {
    const res = await fetchAPI<PerksResponse>('api/perks?featured=true');
    perks = res.perks;
    totalPerks = res.meta.total; // This might be total of filtered results, ideally we need a stats endpoint
    // If no featured, fetch latest
    if (perks.length === 0) {
      const latestRes = await fetchAPI<PerksResponse>('api/perks?limit=6'); // limit not impl in API yet but sort is
      perks = latestRes.perks.slice(0, 6);
    }
  } catch (e) {
    console.error("Failed to fetch perks", e);
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Over {totalPerks || '100+'} student perks indexed</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            The Ultimate Student <br /> Perk Aggregator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover thousands of dollars in free software, discounts, and exclusive offers available to students worldwide.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href={"/perks" as any}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Browse Perks
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <CountrySelector />
          </div>
        </div>
      </section>

      {/* Featured Perks */}
      <section className="container mx-auto px-4 py-16 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Featured Perks</h2>
          </div>
          <Link
            href={"/perks" as any}
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            View All
          </Link>
        </div>

        {perks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map(({ perk }) => (
              <PerkCard key={perk.id} perk={perk} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">No perks found. System might be offline or empty.</p>
          </div>
        )}
      </section>
    </div>
  );
}
