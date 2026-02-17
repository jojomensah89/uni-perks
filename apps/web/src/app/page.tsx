import { fetchAPI } from "@/lib/api";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { CategoriesSection } from "@/components/CategoriesSection";
import { FooterCTA } from "@/components/FooterCTA";

export const runtime = "edge";

interface Deal {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  discountLabel: string;
  brand: { name: string; logoUrl?: string };
  category?: { name: string; slug: string };
  tags?: { id: string; name: string }[];
  coverImageUrl?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  tags: string[];
  isFeatured: boolean;
  // UI props added in transform
  bgColor: string;
  decoration: 'wave' | 'dots' | 'circles' | 'zigzag' | 'grid';
}

interface DealsResponse {
  deals: Deal[];
  meta: any;
}

interface CategoriesResponse {
  categories: Category[];
}

interface CollectionsResponse {
  collections: Omit<Collection, 'bgColor' | 'decoration'>[];
}

// Helper to map collection style based on slug
const getCollectionStyle = (slug: string) => {
  const styles: Record<string, { bgColor: string; decoration: 'wave' | 'dots' | 'circles' | 'zigzag' | 'grid'; tags: string[] }> = {
    'tech-student': { bgColor: 'bg-blue-600 text-white', decoration: 'wave', tags: ['Software', 'Dev Tools'] },
    'creative-suite': { bgColor: 'bg-purple-600 text-white', decoration: 'dots', tags: ['Design', 'Photo', 'Video'] },
    'streaming-bundle': { bgColor: 'bg-green-600 text-white', decoration: 'circles', tags: ['Music', 'TV', 'Movies'] },
    'weekly-essentials': { bgColor: 'bg-orange-500 text-white', decoration: 'zigzag', tags: ['Food', 'Groceries'] },
    'student-lifestyle': { bgColor: 'bg-pink-500 text-white', decoration: 'grid', tags: ['Fashion', 'Travel'] },
  };

  return styles[slug] || { bgColor: 'bg-neutral-800 text-white', decoration: 'grid', tags: ['Featured'] };
};

export default async function Home() {
  // Fetch data in parallel
  const [collectionsRes, categoriesRes] = await Promise.all([
    fetchAPI<CollectionsResponse>('api/collections?featured=true').catch(() => ({ collections: [] })),
    fetchAPI<CategoriesResponse>('api/categories').catch(() => ({ categories: [] })),
  ]);

  // Transform collections for carousel
  const collections = (collectionsRes.collections || []).map((c) => ({
    ...c,
    ...getCollectionStyle(c.slug),
  })) as Collection[];

  // Fetch top deals for top 4 categories
  const topCategories = (categoriesRes.categories || []).slice(0, 4);
  const categoriesWithDeals = await Promise.all(
    topCategories.map(async (cat: Category) => {
      const dealsRes = await fetchAPI<DealsResponse>(`api/deals?category=${cat.slug}&limit=6`).catch(() => ({ deals: [], meta: {} }));
      return {
        category: cat,
        deals: dealsRes.deals || [],
      };
    })
  );

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      <div className="container mx-auto px-4 space-y-16 pb-16">
        {/* Featured Collections Carousel */}
        {collections.length > 0 && (
          <section>
            <FeaturedCarousel collections={collections} />
          </section>
        )}

        {/* Categories with Deals */}
        <CategoriesSection categoriesWithDeals={categoriesWithDeals.filter(c => c.deals.length > 0)} />
      </div>

      <FooterCTA />
    </div>
  );
}
