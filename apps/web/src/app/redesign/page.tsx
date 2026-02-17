import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DealCard } from "@/components/redesign/DealCard"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Laptop, Pizza, Music, Shirt, Plane } from "lucide-react"

// Mock Data
const featuredDeals = [
    {
        brand: "Spotify",
        discount: "Free Hulu",
        title: "Spotify Premium Student + Hulu",
        description: "Get Spotify Premium with Hulu (with ads) included for just $5.99/month.",
        verificationMethod: "SheerID",
        category: "Streaming",
        countries: ["US"],
        slug: "spotify-premium-student",
        isFeatured: true,
    },
    {
        brand: "Adobe",
        discount: "60% Off",
        title: "Creative Cloud All Apps",
        description: "Save over 60% on the entire collection of 20+ creative apps.",
        verificationMethod: "School Email",
        category: "Software",
        countries: ["Global"],
        slug: "adobe-creative-cloud",
        isFeatured: true,
    },
    {
        brand: "Amazon",
        discount: "6 Months Free",
        title: "Amazon Prime Student",
        description: "Start your 6-month trial, then enjoy 50% off Prime.",
        verificationMethod: ".edu Email",
        category: "Shopping",
        countries: ["US", "UK", "CA"],
        slug: "amazon-prime-student",
        isFeatured: true,
    },
    {
        brand: "Nike",
        discount: "10% Off",
        title: "Nike Student Discount",
        description: "Get 10% off your order at Nike.com.",
        verificationMethod: "UNiDAYS",
        category: "Fashion",
        countries: ["Global"],
        slug: "nike-student-discount",
        isFeatured: true
    }

]

const freshmanPack = [
    {
        brand: "Bed Bath & Beyond",
        discount: "20% Off",
        title: "College Savings Pass",
        description: "20% off every purchase for college students.",
        verificationMethod: "SheerID",
        category: "Home",
        countries: ["US"],
        slug: "bbb-college-pass"
    },
    {
        brand: "HelloFresh",
        discount: "15% Off",
        title: "Student Meal Kit Discount",
        description: "15% off every box for a year + free shipping on the first box.",
        verificationMethod: "UNiDAYS",
        category: "Food",
        countries: ["US", "UK"],
        slug: "hellofresh-student"
    },
    {
        brand: "Grammarly",
        discount: "20% Off",
        title: "Grammarly Premium",
        description: "Write better papers with AI-powered writing assistance.",
        verificationMethod: "School Email",
        category: "Software",
        countries: ["Global"],
        slug: "grammarly-student"
    }
]

const categories = [
    { name: "Tech & Software", icon: Laptop, slug: "tech", color: "bg-blue-100 text-blue-600" },
    { name: "Food & Delivery", icon: Pizza, slug: "food", color: "bg-orange-100 text-orange-600" },
    { name: "Streaming", icon: Music, slug: "streaming", color: "bg-purple-100 text-purple-600" },
    { name: "Fashion", icon: Shirt, slug: "fashion", color: "bg-pink-100 text-pink-600" },
    { name: "Travel", icon: Plane, slug: "travel", color: "bg-green-100 text-green-600" },
]

export default function RedesignHomePage() {
    return (
        <div className="flex flex-col gap-16 pb-16">

            {/* 1. Sticky Promo (Note: Ideally this would be dismissed/managed by state) */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 text-sm font-medium px-4">
                🔥 Spotify + Hulu for $5.99/mo — <Link href="/redesign/perks/spotify-premium-student" className="underline hover:text-white/80">Get it now</Link>
            </div>

            {/* 3. Hero Section */}
            <section className="container text-center pt-8 md:pt-12">
                <Badge variant="secondary" className="mb-4">
                    For Students, By Students
                </Badge>
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                    The best student perks. <span className="text-primary">Zero sign-up.</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                    We find the hidden student discounts so you don't have to.
                    No account needed — just click and save.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link href="/redesign/perks" className={cn(buttonVariants({ size: "lg" }))}>
                        Browse All Perks <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link href="#how-it-works" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
                        How It Works
                    </Link>
                </div>
            </section>

            {/* 4. Featured Deals Carousel */}
            <section className="container">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">🔥 This Week's Best Deals</h2>
                    <Link href="/redesign/perks?featured=true" className="text-primary hover:underline text-sm font-medium">View All</Link>
                </div>

                <Carousel className="w-full">
                    <CarouselContent className="-ml-4">
                        {featuredDeals.map((deal, index) => (
                            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="h-full">
                                    <DealCard {...deal} />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </section>

            {/* 5. Category Quick-Nav */}
            <section className="container">
                <h2 className="text-2xl font-bold tracking-tight mb-6">Browse by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {categories.map((cat) => (
                        <Link key={cat.slug} href={`/redesign/perks?category=${cat.slug}`} className="group block h-full">
                            <div className="flex flex-col items-center justify-center p-6 border rounded-xl hover:shadow-md transition-all h-full bg-card text-card-foreground">
                                <div className={`p-3 rounded-full mb-3 ${cat.color} group-hover:scale-110 transition-transform`}>
                                    <cat.icon className="h-6 w-6" />
                                </div>
                                <span className="font-medium text-center">{cat.name}</span>
                                <span className="text-xs text-muted-foreground mt-1">12 deals</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 6. Curated Strip: Freshman Starter Pack */}
            <section className="container">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold tracking-tight">🎒 The Freshman Starter Pack</h2>
                    <Link href="/redesign/perks?collection=freshman" className="text-primary hover:underline text-sm font-medium">View Collection</Link>
                </div>
                <p className="text-muted-foreground mb-6">Everything you need to start uni without breaking the bank.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {freshmanPack.map((deal, i) => (
                        <DealCard key={i} {...deal} />
                    ))}
                </div>
            </section>

            {/* 8. How It Works */}
            <section id="how-it-works" className="container py-12 bg-muted/30 rounded-3xl">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight">How Uni-Perks Works</h2>
                    <p className="text-muted-foreground mt-2">Transparent, simple, and privacy-first.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-10 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-background border flex items-center justify-center rounded-full text-3xl shadow-sm mb-4">🔍</div>
                        <h3 className="text-xl font-bold mb-2">1. Browse</h3>
                        <p className="text-muted-foreground">Find the best student deals, all in one place. Filter by category or country.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-background border flex items-center justify-center rounded-full text-3xl shadow-sm mb-4">🖱️</div>
                        <h3 className="text-xl font-bold mb-2">2. Click</h3>
                        <p className="text-muted-foreground">Hit 'Redeem' and we send you straight to the brand's official verification page.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-background border flex items-center justify-center rounded-full text-3xl shadow-sm mb-4">💰</div>
                        <h3 className="text-xl font-bold mb-2">3. Save</h3>
                        <p className="text-muted-foreground">Verify your student status on the brand's site and enjoy the discount.</p>
                    </div>
                </div>
            </section>

            {/* 10. Newsletter / CTA */}
            <section className="container">
                <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Know a deal we're missing?</h2>
                        <p className="opacity-90 max-w-xl">Help your fellow students save money by suggesting a deal. No account required.</p>
                    </div>
                    <Button size="lg" variant="secondary" className="shrink-0">
                        Suggest a Deal
                    </Button>
                </div>
            </section>

        </div>
    )
}
