"use client";

import { useQuery } from "@tanstack/react-query";
import { DealsTable } from "@/components/admin/DealsTable";
import { DealForm } from "@/components/admin/DealForm";
import { fetchAPI } from "@/lib/api";
import type { ApiDealResponse, ApiBrandResponse, ApiCategoryResponse } from "@/types/api";

export default function AdminDealsPage() {
    const dealsQuery = useQuery({
        queryKey: ["admin_deals"],
        queryFn: () => fetchAPI<{ deals: ApiDealResponse[] }>("/api/admin/deals"),
    });

    const brandsQuery = useQuery({
        queryKey: ["admin_brands"],
        queryFn: () => fetchAPI<{ brands: ApiBrandResponse[] }>("/api/brands"),
    });

    const categoriesQuery = useQuery({
        queryKey: ["admin_categories"],
        queryFn: () => fetchAPI<{ categories: ApiCategoryResponse[] }>("/api/categories"),
    });

    const isLoading = dealsQuery.isLoading || brandsQuery.isLoading || categoriesQuery.isLoading;
    const isError = dealsQuery.isError || brandsQuery.isError || categoriesQuery.isError;

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading details...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col gap-6 items-center justify-center min-h-[50vh]">
                <p className="text-destructive font-semibold">Failed to load data.</p>
                <p className="text-muted-foreground text-sm">Please check your connection and try again.</p>
            </div>
        );
    }

    const deals = dealsQuery.data?.deals || [];
    const brands = brandsQuery.data?.brands || [];
    const categories = categoriesQuery.data?.categories || [];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your exclusive university perks and discounts.
                    </p>
                </div>
                <DealForm brands={brands} categories={categories} />
            </div>

            <DealsTable data={deals} brands={brands} categories={categories} />
        </div>
    );
}
