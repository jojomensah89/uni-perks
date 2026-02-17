import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Lock } from "lucide-react"

interface DealCardProps {
    brand: string
    discount: string
    title: string
    description: string
    verificationMethod: string
    category: string
    countries: string[]
    slug: string
    logoUrl?: string
    isFeatured?: boolean
}

export function DealCard({
    brand,
    discount,
    title,
    description,
    verificationMethod,
    category,
    countries,
    slug,
    logoUrl,
    isFeatured = false,
}: DealCardProps) {
    return (
        <Card className={`flex flex-col h-full hover:shadow-lg transition-shadow duration-200 overflow-hidden ${isFeatured ? 'border-primary/50 border-2' : ''}`}>
            <CardHeader className="p-0 relative aspect-[16/9] bg-muted flex items-center justify-center">
                {/* Placeholder for Logo/Image if not provided */}
                {logoUrl ? (
                    <img src={logoUrl} alt={brand} className="w-full h-full object-cover" />
                ) : (
                    <div className="text-2xl font-bold text-muted-foreground">{brand}</div>
                )}
                <Badge className="absolute top-2 right-2" variant="secondary">
                    {discount}
                </Badge>
                {isFeatured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600 text-white">
                        Featured
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="flex-1 p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs font-normal">
                        {category}
                    </Badge>
                    <div className="flex gap-1 text-xs text-muted-foreground" title={countries.join(", ")}>
                        {countries.slice(0, 3).map(c => (
                            <span key={c}>{c === 'US' ? '🇺🇸' : c === 'UK' ? '🇬🇧' : c === 'CA' ? '🇨🇦' : c}</span>
                        ))}
                        {countries.length > 3 && <span>+{countries.length - 3}</span>}
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 p-1.5 rounded-md">
                    <Lock className="w-3 h-3" />
                    <span>Verify via {verificationMethod}</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button className="w-full">
                    <Link href={`/redesign/perks/${slug}`}>
                        View Deal
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
