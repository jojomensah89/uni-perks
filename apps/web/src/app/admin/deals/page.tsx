"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DealsTable } from "@/components/admin/DealsTable";
import { DealForm } from "@/components/admin/DealForm";
import { fetchAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApiDealResponse, ApiBrandResponse, ApiCategoryResponse } from "@/types/api";

const STATUS_FILTERS = [
    { value: "all", label: "All Deals" },
    { value: "pending", label: "Pending", color: "bg-yellow-500 text-white" },
    { value: "approved", label: "Approved", color: "bg-blue-500 text-white" },
    { value: "published", label: "Published", color: "bg-green-500 text-white" },
    { value: "rejected", label: "Rejected", color: "bg-red-500 text-white" },
    { value: "archived", label: "Archived", color: "bg-gray-500 text-white" },
];

export default function AdminDealsPage() {
    const [statusFilter, setStatusFilter] = useState("all");

    const dealsQuery = useQuery({
        queryKey: ["admin_deals"],
        queryFn: () => fetchAPI<{ deals: ApiDealResponse[] }>("/api/admin/deals"),
    });

    const brandsQuery = useQuery({
        queryKey: ["admin_brands"],
        queryFn: () => fetchAPI<{ brands: ApiBrandResponse[] }>("/api/admin/brands"),
    });

    const categoriesQuery = useQuery({
        queryKey: ["admin_categories"],
        queryFn: () => fetchAPI<{ categories: ApiCategoryResponse[] }>("/api/admin/categories"),
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

    const allDeals = dealsQuery.data?.deals || [];
    const brands = brandsQuery.data?.brands || [];
    const categories = categoriesQuery.data?.categories || [];

    const filteredDeals = statusFilter === "all"
        ? allDeals
        : allDeals.filter(d => d.deal.status === statusFilter);

    const statusCounts = {
        all: allDeals.length,
        pending: allDeals.filter(d => d.deal.status === "pending").length,
        approved: allDeals.filter(d => d.deal.status === "approved").length,
        published: allDeals.filter(d => d.deal.status === "published").length,
        rejected: allDeals.filter(d => d.deal.status === "rejected").length,
        archived: allDeals.filter(d => d.deal.status === "archived").length,
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage deals and approve new submissions.
                    </p>
                </div>
                <DealForm brands={brands} categories={categories} />
            </div>

            <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map(filter => (
                    <Button
                        key={filter.value}
                        variant={statusFilter === filter.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(filter.value)}
                        className={filter.color && statusFilter === filter.value ? `${filter.color} hover:${filter.color}` : ""}
                    >
                        {filter.label}
                        {statusCounts[filter.value as keyof typeof statusCounts] > 0 && (
                            <Badge variant="outline" className="ml-2 bg-background/50">
                                {statusCounts[filter.value as keyof typeof statusCounts]}
                            </Badge>
                        )}
                    </Button>
                ))}
            </div>

            <DealsTable data={filteredDeals} brands={brands} categories={categories} />
        </div>
    );
}
