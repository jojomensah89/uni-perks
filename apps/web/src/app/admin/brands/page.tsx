"use client";

import { useQuery } from "@tanstack/react-query";
import { BrandsTable } from "@/components/admin/BrandsTable";
import { BrandForm } from "@/components/admin/BrandForm";
import { fetchAPI } from "@/lib/api";

import type { ApiBrandResponse } from "@/types/api";

export default function AdminBrandsPage() {
    const brandsQuery = useQuery({
        queryKey: ["admin_brands"],
        queryFn: () => fetchAPI<{ brands: ApiBrandResponse[] }>("/api/admin/brands"),
    });

    if (brandsQuery.isLoading) {
        return (
            <div className="flex flex-col gap-6 items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading brands...</p>
            </div>
        );
    }

    if (brandsQuery.isError) {
        return (
            <div className="flex flex-col gap-6 items-center justify-center min-h-[50vh]">
                <p className="text-destructive font-semibold">Failed to load brands.</p>
                <p className="text-muted-foreground text-sm">Please check your connection and try again.</p>
            </div>
        );
    }

    const brands = brandsQuery.data?.brands || [];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage partner brands and companies.
                    </p>
                </div>
                <BrandForm />
            </div>

            <BrandsTable data={brands} />
        </div>
    );
}
