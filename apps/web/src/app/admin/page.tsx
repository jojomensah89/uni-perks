"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Eye, MousePointerClick, Building2, Tag, Layers } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { fetchAPI } from "@/lib/api";

interface AdminStats {
    totalDeals: number;
    activeDeals: number;
    totalBrands: number;
    totalCategories: number;
    totalCollections: number;
    totalViews: number;
    totalClicks: number;
}

export default function AdminDashboard() {
    const { data: session } = authClient.useSession();

    const statsQuery = useQuery({
        queryKey: ["admin_stats"],
        queryFn: () => fetchAPI<AdminStats>("/api/admin/stats"),
    });

    const stats = statsQuery.data || {
        totalDeals: 0,
        activeDeals: 0,
        totalBrands: 0,
        totalCategories: 0,
        totalCollections: 0,
        totalViews: 0,
        totalClicks: 0,
    };

    const isLoading = statsQuery.isLoading;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back, {session?.user?.name || "Admin"}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "..." : stats.totalDeals}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {isLoading ? "..." : stats.activeDeals} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Brands</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "..." : stats.totalBrands}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Partner brands
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "..." : stats.totalViews.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All time
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "..." : stats.totalClicks.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All time
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "..." : stats.totalCategories}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Active categories
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Collections</CardTitle>
                        <Layers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "..." : stats.totalCollections}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Curated collections
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Manage your deals and content</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Link href="/admin/deals" className={buttonVariants()}>
                        Add New Deal
                    </Link>
                    <Link href="/admin/brands" className={buttonVariants({ variant: "outline" })}>
                        Manage Brands
                    </Link>
                    <Link href={"/admin/collections" as any} className={buttonVariants({ variant: "outline" })}>
                        Manage Collections
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
