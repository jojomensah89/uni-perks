import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DealCard } from "@/components/redesign/DealCard"
import { Check, ShieldCheck, Share2, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react"

// Mock Data
const perk = {
    brand: "Spotify",
    title: "Spotify Premium Student + Hulu",
    discount: "Free Hulu",
    description: "Get Spotify Premium with Hulu (with ads) included for just $5.99/month. Open to verified students at accredited colleges and universities.",
    longDescription: `
    <p>Spotify Premium Student with Hulu is one of the best entertainment deals available for college students. For just $5.99/month, you get ad-free music listening on Spotify plus full access to Hulu's ad-supported plan.</p>
    <p class="mt-4">This bundle saves you over $15/month compared to subscribing separately. Verification is handled instantly through SheerID using your university email address or class schedule.</p>
  `,
    verificationMethod: "SheerID",
    category: "Streaming",
    value: "$200/year savings",
    countries: ["US"],
    lastVerified: "Feb 12, 2026",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg", // Using external URL for mock, in real app use local assets
}

const relatedDeals = [
    {
        brand: "Apple Music",
        discount: "$5.99/mo",
        title: "Apple Music Student",
        description: "Get Apple Music and Apple TV+ for a low monthly price.",
        verificationMethod: "UNiDAYS",
        category: "Streaming",
        countries: ["Global"],
        slug: "apple-music-student",
    },
    {
        brand: "Amazon Music",
        discount: "$0.99/mo",
        title: "Amazon Music Unlimited",
        description: "Add on to your Prime Student membership.",
        verificationMethod: ".edu Email",
        category: "Streaming",
        countries: ["US", "UK"],
        slug: "amazon-music-student",
    },
    {
        brand: "Peacock",
        discount: "$1.99/mo",
        title: "Peacock Premium Student",
        description: "Stream hit movies, live sports, and more.",
        verificationMethod: "SheerID",
        category: "Streaming",
        countries: ["US"],
        slug: "peacock-student",
    }
]

export default function RedesignPerkDetailPage({ params }: { params: { slug: string } }) {
    return (
        <div className="container py-8 max-w-5xl">
            {/* 1. Breadcrumbs */}
            <div className="flex items-center text-sm text-muted-foreground mb-6">
                <Link href="/redesign" className="hover:underline">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/redesign/perks" className="hover:underline">Perks</Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">{perk.category}</span>
                <span className="mx-2">/</span>
                <span className="text-foreground font-medium">{perk.brand}</span>
            </div>

            {/* 2. Perk Hero */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-xl flex items-center justify-center p-2 shrink-0">
                            {/* Placeholder Logo */}
                            <div className="text-2xl font-bold">S</div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">{perk.title}</h1>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <Badge className="bg-green-600 hover:bg-green-700">{perk.discount}</Badge>
                                <Badge variant="outline">{perk.category}</Badge>
                                <Badge variant="secondary" className="gap-1"><ShieldCheck className="w-3 h-3" /> Verify via {perk.verificationMethod}</Badge>
                            </div>
                            <p className="text-muted-foreground text-lg">{perk.description}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-12 shadow-lg shadow-primary/20">
                            Redeem Deal <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" className="w-full sm:w-auto">
                            <Share2 className="mr-2 h-4 w-4" /> Share
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                        <span>Last verified: <span className="font-medium text-foreground">{perk.lastVerified}</span></span>
                        <span className="mx-2">•</span>
                        <span>Available in: 🇺🇸 US</span>
                    </div>
                </div>

                {/* Right Column / Visual */}
                <div className="hidden md:block bg-gradient-to-br from-green-100 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <div className="text-center space-y-4">
                        <div className="text-4xl">🎧 + 📺</div>
                        <p className="font-medium text-green-900">Save over $200/year with this bundle.</p>
                        <p className="text-sm text-green-700">One of our most redeemed deals.</p>
                    </div>
                </div>
            </div>

            <Separator className="my-12" />

            <div className="grid md:grid-cols-3 gap-12">
                {/* 3. Steps */}
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold mb-6">How to Get This Deal</h2>
                    <div className="space-y-8 relative pl-2">
                        {/* Timeline Line */}
                        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-muted"></div>

                        <div className="relative flex gap-6">
                            <div className="relative z-10 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0 ring-4 ring-background">1</div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Click "Redeem Deal"</h3>
                                <p className="text-muted-foreground">We'll take you directly to Spotify's official student verification page.</p>
                            </div>
                        </div>

                        <div className="relative flex gap-6">
                            <div className="relative z-10 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0 ring-4 ring-background">2</div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Verify Your Status</h3>
                                <p className="text-muted-foreground">Log in with your university credentials or upload a document (class schedule, transcript) via SheerID.</p>
                            </div>
                        </div>

                        <div className="relative flex gap-6">
                            <div className="relative z-10 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0 ring-4 ring-background">3</div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Enjoy the Discount</h3>
                                <p className="text-muted-foreground">Once verified, the $5.99/mo pricing will be applied to your account automatically. You'll need to re-verify once every 12 months.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12">
                        <h3 className="font-bold text-lg mb-4">About this Deal</h3>
                        <div dangerouslySetInnerHTML={{ __html: perk.longDescription }} className="prose prose-sm text-muted-foreground"></div>
                    </div>
                </div>

                {/* 4. Details Panel */}
                <div className="space-y-8">
                    <div className="border rounded-xl p-6 bg-card shadow-sm">
                        <h3 className="font-bold mb-4">Deal Details</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Value</span>
                                <span className="font-medium">{perk.value}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Verification</span>
                                <span className="font-medium">{perk.verificationMethod}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Eligibility</span>
                                <span className="font-medium text-right w-1/2">Enrolled student</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Expiration</span>
                                <span className="font-medium">No set date</span>
                            </div>
                            <div className="pt-2">
                                <div className="text-xs text-muted-foreground mb-2">Was this deal helpful?</div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 gap-2"><ThumbsUp className="h-3 w-3" /> Yes</Button>
                                    <Button variant="outline" size="sm" className="flex-1 gap-2"><ThumbsDown className="h-3 w-3" /> No</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Related Deals */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold mb-6">More Deals You'll Love</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedDeals.map((deal, i) => (
                        <DealCard key={i} {...deal} />
                    ))}
                </div>
            </div>
        </div>
    )
}
