"use client"

import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"

export default function BrandsPage() {
    return (
        <div className="container py-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Brands</h1>
            <p className="text-xl text-muted-foreground mb-8">
                Browse student discounts by your favorite brands.
            </p>
            <div className="p-12 border border-dashed rounded-lg bg-muted/30">
                <p className="text-muted-foreground italic">Brand listing coming soon...</p>
            </div>
            <div className="mt-8">
                <Link href="/deals" className={buttonVariants()}>View All Deals</Link>
            </div>
        </div>
    )
}
