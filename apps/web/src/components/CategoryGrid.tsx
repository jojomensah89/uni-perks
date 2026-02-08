import Link from "next/link";
import type { Category } from "@/types";
import {
    Code,
    Coffee,
    Monitor,
    Music,
    ShoppingBag,
    Utensils,
    Zap,
    GraduationCap,
    Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

// Map slugs to Lucide icons
const iconMap: Record<string, any> = {
    tech: Monitor,
    food: Utensils,
    fashion: ShoppingBag,
    entertainment: Music,
    software: Code,
    lifestyle: Coffee,
    education: GraduationCap,
    default: Zap
};

interface CategoryGridProps {
    categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
    const categoryStyles = [
        "bg-blue-600 border-blue-400 text-white hover:bg-blue-500", // Cloud - Blue
        "bg-purple-600 border-purple-400 text-white hover:bg-purple-500", // AI - Purple
        "bg-green-600 border-green-400 text-white hover:bg-green-500", // DB - Green
        "bg-orange-600 border-orange-400 text-white hover:bg-orange-500", // Analytics - Orange
        "bg-cyan-600 border-cyan-400 text-white hover:bg-cyan-500", // Dev - Cyan
        "bg-pink-600 border-pink-400 text-white hover:bg-pink-500", // Comm - Pink
        "bg-yellow-600 border-yellow-400 text-white hover:bg-yellow-500", // Design - Yellow
        "bg-gray-600 border-gray-400 text-white hover:bg-gray-500", // Other - Grey
    ];

    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <section className="container mx-auto px-4 py-12">
            <h2 className="mb-8 text-center text-3xl font-black uppercase tracking-tight">By Category</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {categories.map((category, index) => {
                    // Cyclic assignment of colors if more than 8
                    const styleClass = categoryStyles[index % categoryStyles.length];
                    const Icon = iconMap[category.slug] || iconMap.default;

                    return (
                        <Link
                            key={category.id}
                            href={`/perks?category=${category.slug}` as any}
                            className={cn(
                                "group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-lg border-2 p-6 text-center shadow-md transition-all hover:scale-[1.02] hover:shadow-lg h-32",
                                styleClass
                            )}
                        >
                            <div className="flex bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-wide">{category.name}</span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
