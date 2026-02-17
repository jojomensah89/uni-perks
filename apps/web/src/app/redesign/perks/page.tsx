"use client"

import * as React from "react"
import { DealCard } from "@/components/redesign/DealCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CountrySelector } from "@/components/redesign/CountrySelector"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

// Mock Data
const allPerks = Array.from({ length: 12 }).map((_, i) => ({
    brand: i % 2 === 0 ? "Adobe" : "Spotify",
    discount: i % 2 === 0 ? "60% Off" : "Free Hulu",
    title: i % 2 === 0 ? "Creative Cloud All Apps" : "Spotify Premium Student",
    description: "Get the best student discount on this amazing service.",
    verificationMethod: i % 3 === 0 ? "SheerID" : "UNiDAYS",
    category: i % 4 === 0 ? "Tech" : "Streaming",
    countries: ["US", "UK"],
    slug: i % 2 === 0 ? "adobe-creative-cloud" : "spotify-premium-student",
    isFeatured: i === 0,
}))

const categories = ["All", "Tech", "Food", "Streaming", "Fashion", "Travel", "Health"]

export default function RedesignPerksPage() {
    const [activeCategory, setActiveCategory] = React.useState("All")

    return (
        <div className="container py-8">
            {/* 1. Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Student Perks</h1>
                <p className="text-muted-foreground">142 verified student deals available</p>
            </div>

            {/* 2. Filter Bar */}
            <div className="sticky top-16 z-40 bg-background/95 backdrop-blur py-4 border-b mb-8 space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Mobile Search */}
                    <div className="relative w-full md:hidden">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Search..." className="pl-9 w-full" />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={activeCategory === cat ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveCategory(cat)}
                                className="whitespace-nowrap rounded-full"
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                        <CountrySelector />
                        <Select defaultValue="relevance">
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="relevance">Relevance</SelectItem>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="popular">Most Popular</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 3. Active Filters (Mock) */}
                {activeCategory !== "All" && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Active filters:</span>
                        <Badge variant="secondary" className="gap-1 pr-1">
                            {activeCategory}
                            <button onClick={() => setActiveCategory("All")} className="hover:bg-muted rounded-full p-0.5"><X className="h-3 w-3" /></button>
                        </Badge>
                        <Button variant="link" size="sm" onClick={() => setActiveCategory("All")} className="text-muted-foreground h-auto p-0">Clear all</Button>
                    </div>
                )}
            </div>

            {/* 4. Deal Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {allPerks.map((perk, i) => (
                    <DealCard key={i} {...perk} />
                ))}
            </div>

            {/* 6. Load More */}
            <div className="text-center">
                <Button variant="outline" size="lg" className="min-w-[200px]">
                    Load More
                </Button>
                <p className="text-xs text-muted-foreground mt-4">Showing 12 of 142 deals</p>
            </div>

        </div>
    )
}
