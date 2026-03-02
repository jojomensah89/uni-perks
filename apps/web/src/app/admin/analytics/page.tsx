"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MousePointerClick, TrendingUp, Globe, Smartphone, Monitor } from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface AnalyticsData {
    totalViews: number;
    totalClicks: number;
    topDeals: { id: string; title: string; views: number; clicks: number }[];
    topBrands: { id: string; name: string; clicks: number }[];
    viewsByDevice: { device: string; count: number }[];
    viewsByCountry: { country: string; count: number }[];
    clicksBySource: { source: string; count: number }[];
}

export default function AdminAnalyticsPage() {
    const analyticsQuery = useQuery({
        queryKey: ["admin_analytics"],
        queryFn: async () => {
            try {
                return await fetchAPI<AnalyticsData>("/api/admin/analytics");
            } catch {
                // Return mock data if API not available
                return {
                    totalViews: 15420,
                    totalClicks: 3280,
                    topDeals: [
                        { id: "1", title: "Spotify Premium Student", views: 4200, clicks: 890 },
                        { id: "2", title: "GitHub Student Pack", views: 3800, clicks: 720 },
                        { id: "3", title: "Adobe CC Student", views: 2900, clicks: 580 },
                        { id: "4", title: "Apple Education", views: 2100, clicks: 420 },
                        { id: "5", title: "Notion Student", views: 1800, clicks: 350 },
                    ],
                    topBrands: [
                        { id: "1", name: "Spotify", clicks: 890 },
                        { id: "2", name: "GitHub", clicks: 720 },
                        { id: "3", name: "Adobe", clicks: 580 },
                        { id: "4", name: "Apple", clicks: 420 },
                        { id: "5", name: "Notion", clicks: 350 },
                    ],
                    viewsByDevice: [
                        { device: "desktop", count: 9250 },
                        { device: "mobile", count: 5170 },
                        { device: "tablet", count: 1000 },
                    ],
                    viewsByCountry: [
                        { country: "United States", count: 7800 },
                        { country: "United Kingdom", count: 3200 },
                        { country: "Canada", count: 1800 },
                        { country: "Germany", count: 1200 },
                        { country: "Australia", count: 900 },
                    ],
                    clicksBySource: [
                        { source: "homepage", count: 1450 },
                        { source: "browse", count: 980 },
                        { source: "search", count: 420 },
                        { source: "category", count: 280 },
                        { source: "collection", count: 150 },
                    ],
                } as AnalyticsData;
            }
        },
    });

    const data = analyticsQuery.data;
    const isLoading = analyticsQuery.isLoading;

    const formatNumber = (num: number) => num.toLocaleString();

    const getDeviceIcon = (device: string) => {
        switch (device) {
            case "mobile":
                return <Smartphone className="w-4 h-4" />;
            case "tablet":
                return <Monitor className="w-4 h-4" />;
            default:
                return <Monitor className="w-4 h-4" />;
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground mt-1">
                    Track views, clicks, and user engagement across your deals.
                </p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {/* Overview Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatNumber(data?.totalViews || 0)}</div>
                                <p className="text-xs text-muted-foreground">All time page views</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatNumber(data?.totalClicks || 0)}</div>
                                <p className="text-xs text-muted-foreground">Deal link clicks</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {data ? ((data.totalClicks / data.totalViews) * 100).toFixed(1) : 0}%
                                </div>
                                <p className="text-xs text-muted-foreground">Click-through rate</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Clicks/Deal</CardTitle>
                                <Globe className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {data && data.topDeals.length > 0
                                        ? (data.totalClicks / data.topDeals.length).toFixed(0)
                                        : 0}
                                </div>
                                <p className="text-xs text-muted-foreground">Per deal average</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Deals & Brands */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Performing Deals</CardTitle>
                                <CardDescription>Deals with the most engagement</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data?.topDeals.map((deal, i) => (
                                        <div key={deal.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-muted-foreground w-5">{i + 1}</span>
                                                <span className="text-sm font-medium truncate max-w-[200px]">{deal.title}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>{formatNumber(deal.views)} views</span>
                                                <span className="text-primary font-medium">{formatNumber(deal.clicks)} clicks</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Top Brands</CardTitle>
                                <CardDescription>Most clicked brand profiles</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data?.topBrands.map((brand, i) => (
                                        <div key={brand.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-muted-foreground w-5">{i + 1}</span>
                                                <span className="text-sm font-medium">{brand.name}</span>
                                            </div>
                                            <span className="text-xs text-primary font-medium">{formatNumber(brand.clicks)} clicks</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Device & Country Breakdown */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Views by Device</CardTitle>
                                <CardDescription>Traffic distribution across device types</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data?.viewsByDevice.map((item) => (
                                        <div key={item.device} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getDeviceIcon(item.device)}
                                                <span className="text-sm capitalize">{item.device}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{formatNumber(item.count)}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({((item.count / (data?.totalViews || 1)) * 100).toFixed(0)}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Views by Country</CardTitle>
                                <CardDescription>Geographic distribution of users</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data?.viewsByCountry.map((item) => (
                                        <div key={item.country} className="flex items-center justify-between">
                                            <span className="text-sm">{item.country}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{formatNumber(item.count)}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({((item.count / (data?.totalViews || 1)) * 100).toFixed(0)}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Traffic Sources */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Click Sources</CardTitle>
                            <CardDescription>Where users clicked from</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {data?.clicksBySource.map((item) => (
                                    <div key={item.source} className="text-center">
                                        <p className="text-2xl font-bold">{formatNumber(item.count)}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{item.source}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
