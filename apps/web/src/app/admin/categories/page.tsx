"use client";

import { useQuery } from "@tanstack/react-query";
import { CategoriesTable } from "@/components/admin/CategoriesTable";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { fetchAPI } from "@/lib/api";

import type { ApiCategoryResponse } from "@/types/api";

export default function AdminCategoriesPage() {
    const categoriesQuery = useQuery({
        queryKey: ["admin_categories"],
        queryFn: () => fetchAPI<{ categories: ApiCategoryResponse[] }>("/api/categories"),
    });

    if (categoriesQuery.isLoading) {
        return (
            <div className="flex flex-col gap-6 items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading categories...</p>
            </div>
        );
    }

    if (categoriesQuery.isError) {
        return (
            <div className="flex flex-col gap-6 items-center justify-center min-h-[50vh]">
                <p className="text-destructive font-semibold">Failed to load categories.</p>
                <p className="text-muted-foreground text-sm">Please check your connection and try again.</p>
            </div>
        );
    }

    const categories = categoriesQuery.data?.categories || [];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage deal categories and their display settings.
                    </p>
                </div>
                <CategoryForm />
            </div>

            <CategoriesTable data={categories} />
        </div>
    );
}
