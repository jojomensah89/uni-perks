import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowUpRight, Users, MousePointerClick, DollarSign, Activity } from "lucide-react"

// Mock Data
const recentPerks = [
    {
        brand: "Spotify",
        date: "2026-02-12",
        clicks: 1234,
        status: "Active",
        country: "US"
    },
    {
        brand: "Adobe",
        date: "2026-02-11",
        clicks: 850,
        status: "Active",
        country: "Global"
    },
    {
        brand: "Nike",
        date: "2026-02-10",
        clicks: 543,
        status: "Active",
        country: "US"
    },
    {
        brand: "Apple Music",
        date: "2026-02-09",
        clicks: 432,
        status: "Expired",
        country: "UK"
    },
    {
        brand: "Amazon Prime",
        date: "2026-02-08",
        clicks: 321,
        status: "Active",
        country: "CA"
    },
]

export default function RedesignDashboardPage() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">

                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                        <Button>Add New Perk</Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                        <Card x-chunk="dashboard-01-chunk-0">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Perks
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">142</div>
                                <p className="text-xs text-muted-foreground">
                                    +12 from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card x-chunk="dashboard-01-chunk-1">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Users
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+2350</div>
                                <p className="text-xs text-muted-foreground">
                                    +180.1% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card x-chunk="dashboard-01-chunk-2">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+12,234</div>
                                <p className="text-xs text-muted-foreground">
                                    +19% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card x-chunk="dashboard-01-chunk-3">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Featured Deals</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">8</div>
                                <p className="text-xs text-muted-foreground">
                                    Currently active
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
                            <CardHeader className="flex flex-row items-center">
                                <div className="grid gap-2">
                                    <CardTitle>Top Performing Perks</CardTitle>
                                    <CardDescription>
                                        Highest click-through rates this week.
                                    </CardDescription>
                                </div>
                                <a href="#" className={cn(buttonVariants({ size: "sm" }), "ml-auto gap-1")}>
                                    View All
                                    <ArrowUpRight className="h-4 w-4" />
                                </a>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Brand</TableHead>
                                            <TableHead className="hidden xl:table-cell">
                                                Country
                                            </TableHead>
                                            <TableHead className="hidden xl:table-cell">
                                                Status
                                            </TableHead>
                                            <TableHead className="hidden xl:table-cell">
                                                Date
                                            </TableHead>
                                            <TableHead className="text-right">Clicks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentPerks.map((perk) => (
                                            <TableRow key={perk.brand}>
                                                <TableCell>
                                                    <div className="font-medium">{perk.brand}</div>
                                                </TableCell>
                                                <TableCell className="hidden xl:table-cell">
                                                    {perk.country}
                                                </TableCell>
                                                <TableCell className="hidden xl:table-cell">
                                                    <Badge className="text-xs" variant={perk.status === 'Active' ? 'outline' : 'secondary'}>
                                                        {perk.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden xl:table-cell">
                                                    {perk.date}
                                                </TableCell>
                                                <TableCell className="text-right">{perk.clicks}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <Card x-chunk="dashboard-01-chunk-5">
                            <CardHeader>
                                <CardTitle>Engagement by Country</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-8">
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl">🇺🇸</div>
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium leading-none">
                                            United States
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            65% of traffic
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">8,234 clicks</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl">🇬🇧</div>
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium leading-none">
                                            United Kingdom
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            15% of traffic
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">1,922 clicks</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl">🇨🇦</div>
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium leading-none">
                                            Canada
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            10% of traffic
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">1,200 clicks</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl">🇦🇺</div>
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium leading-none">
                                            Australia
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            5% of traffic
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">650 clicks</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}
