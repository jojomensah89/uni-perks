"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { Category } from "@/types";

interface CategoryFilterProps {
    categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get("category");

    // Helper to create link with preserving other params
    const getHref = (slug: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug) {
            params.set("category", slug);
        } else {
            params.delete("category");
        }
        return `/perks?${params.toString()}`;
    };

    return (
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Categories</h3>
            <div className="flex flex-col space-y-1">
                <Link
                    href={getHref(null) as any}
                    className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "justify-start text-sm w-full",
                        !currentCategory && "bg-secondary font-medium"
                    )}
                >
                    All Categories
                </Link>
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={getHref(cat.slug) as any}
                        className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "justify-start text-sm w-full",
                            currentCategory === cat.slug && "bg-secondary font-medium"
                        )}
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}
