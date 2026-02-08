import { PerkCard } from "@/components/PerkCard";
import { Filter } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import type { Perk, Category } from "@/types";
import { PerksFilters } from "@/components/PerksFilters";
import { Suspense } from "react";
import type { Metadata } from "next";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "All Perks",
  description: "Browse and filter through hundreds of student discounts, perks, and credits from top companies. Find exclusive deals on software, services, and more.",
};

interface PerksPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

interface PerksResponse {
  perks: { perk: Perk; category: any }[];
  meta: any;
}

interface CategoriesResponse {
  categories: Category[];
}

export default async function PerksPage({ searchParams }: PerksPageProps) {
  const params = await searchParams;
  const categorySlug = typeof params.category === "string" ? params.category : undefined;
  const featured = params.featured === 'true';
  const searchTerm = typeof params.search === "string" ? params.search : undefined;

  // Build query string
  const queryParts: string[] = [];
  if (categorySlug) queryParts.push(`category=${categorySlug}`);
  if (featured) queryParts.push(`featured=true`);
  if (searchTerm) queryParts.push(`q=${searchTerm}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  // Parallel fetch: Perks (filtered) + All Perks (for counts) + Categories
  const [perksRes, allPerksRes, categoriesRes] = await Promise.all([
    fetchAPI<PerksResponse>(`api/perks${queryString}`).catch(() => ({ perks: [], meta: { total: 0 } })),
    fetchAPI<PerksResponse>('api/perks').catch(() => ({ perks: [], meta: { total: 0 } })),
    fetchAPI<CategoriesResponse>('api/categories').catch(() => ({ categories: [] })),
  ]);

  let perks = perksRes.perks || [];
  const allPerks = allPerksRes.perks || [];
  const categories = categoriesRes.categories || [];
  const totalPerks = perksRes.meta?.total || perks.length;

  // Calculate category counts from all perks
  const categoryCounts = new Map<string, number>();
  allPerks.forEach(({ perk, category }) => {
    if (category?.slug) {
      categoryCounts.set(category.slug, (categoryCounts.get(category.slug) || 0) + 1);
    }
  });

  // Add counts to categories
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    count: categoryCounts.get(cat.slug) || 0,
  }));

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen max-w-7xl">
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-black tracking-tight">All Perks</h1>
        <p className="text-muted-foreground text-lg">Browse and filter through {totalPerks}+ startup programs, credits, and discounts.</p>
      </div>

      {/* Filter Container */}
      <Suspense fallback={
        <div className="rounded-xl border bg-card p-4 shadow-sm mb-8 h-48 animate-pulse" />
      }>
        <PerksFilters
          categories={categoriesWithCounts}
          totalPerks={totalPerks}
          currentCategory={categorySlug}
          currentFeatured={featured}
        />
      </Suspense>

      {/* Results Count Section */}
      <div className="mb-6 flex items-baseline gap-2">
        <span className="text-2xl font-bold">{perks.length}</span>
        <span className="text-muted-foreground">results</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {perks.map(({ perk }) => (
          <PerkCard key={perk.id} perk={perk} />
        ))}
      </div>

      {/* Empty State */}
      {perks.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed rounded-xl bg-muted/5">
          <Filter className="w-10 h-10 text-muted-foreground opacity-20 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No perks found</h3>
          <p className="text-muted-foreground">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
