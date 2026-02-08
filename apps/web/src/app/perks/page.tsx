import { PerkCard } from "@/components/PerkCard";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Filter } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import type { Perk, Category } from "@/types";
import { cn } from "@/lib/utils";

export const runtime = "edge";

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
  const countryCode = typeof params.country === "string" ? params.country : undefined;

  // Build query string
  const queryParts: string[] = [];
  if (categorySlug) queryParts.push(`category=${categorySlug}`);
  if (countryCode) queryParts.push(`country=${countryCode}`);
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  // Parallel fetch: Perks + Categories
  const [perksRes, categoriesRes] = await Promise.all([
    fetchAPI<PerksResponse>(`api/perks${queryString}`).catch(() => ({ perks: [], meta: {} })),
    fetchAPI<CategoriesResponse>('api/categories').catch(() => ({ categories: [] })),
  ]);

  const perks = perksRes.perks || [];
  const categories = categoriesRes.categories || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="flex items-center gap-2 font-semibold mb-4">
            <Filter className="w-4 h-4" />
            Filters
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
            <div className="flex flex-col gap-1">
              <Link
                href={"/perks" as any}
                className={cn(buttonVariants({ variant: !categorySlug ? "secondary" : "ghost" }), "justify-start")}
              >
                All Categories
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/perks?category=${cat.slug}` as any}
                  className={cn(buttonVariants({ variant: categorySlug === cat.slug ? "secondary" : "ghost" }), "justify-start")}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">
              {categorySlug
                ? categories.find(c => c.slug === categorySlug)?.name || 'Perks'
                : 'All Student Perks'}
            </h1>
            <p className="text-muted-foreground">
              {perks.length} results found
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map(({ perk }) => (
              <PerkCard key={perk.id} perk={perk} />
            ))}
          </div>

          {perks.length === 0 && (
            <div className="py-12 text-center border rounded-lg">
              <p className="text-lg font-medium">No perks found in this category.</p>
              <Link
                href={"/perks" as any}
                className={cn(buttonVariants({ variant: "link" }), "mt-2")}
              >
                View all perks
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
