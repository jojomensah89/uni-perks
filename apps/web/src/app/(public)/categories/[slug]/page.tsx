import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import DealCard, { type ApiDealResponse } from "@/components/DealCard";
import type { Metadata } from "next";

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
}

interface ApiCategoryDetail {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    color?: string | null;
    coverImageUrl?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const data = await fetchAPI<{ category: ApiCategoryDetail }>(`/api/categories/${slug}`);
        if (!data || !data.category) return { title: "Category Not Found" };
        return {
            title: data.category.metaTitle || `${data.category.name} Student Discounts`,
            description: data.category.metaDescription || `Student discounts for ${data.category.name}`,
        };
    } catch {
        return { title: "Category Not Found" };
    }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = await params;

    let categoryData: { category: ApiCategoryDetail; deals: ApiDealResponse[] } | null = null;

    try {
        categoryData = await fetchAPI<{ category: ApiCategoryDetail; deals: ApiDealResponse[] }>(`/api/categories/${slug}`);
    } catch {
        notFound();
    }

    if (!categoryData || !categoryData.category) {
        notFound();
    }

    const { category, deals } = categoryData;

    // Get category color for background
    const categoryColor = category.color || "#6366f1";

    return (
        <div className="max-w-[1440px] mx-auto bg-background min-h-screen">
            {/* Hero */}
            <div
                className="relative overflow-hidden rounded-xl mx-4 mt-4 h-[200px] md:h-[280px]"
                style={{ backgroundColor: `${categoryColor}20` }}
            >
                {category.coverImageUrl ? (
                    <img
                        src={category.coverImageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover"
                    />
                ) : null}
                <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to bottom, transparent, ${categoryColor}40)` }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                        {category.name}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {deals.length} student discount{deals.length !== 1 ? "s" : ""} available
                    </p>
                </div>
            </div>

            {/* Deals Grid */}
            <div className="p-4 md:p-6">
                {deals.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed rounded-xl">
                        <p className="text-muted-foreground font-medium">No deals in this category yet.</p>
                        <p className="text-sm text-muted-foreground mt-1">Check back soon for new offers!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {deals.map((dealWrapper) => (
                            <DealCard
                                key={dealWrapper.deal.id}
                                dealData={dealWrapper}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
