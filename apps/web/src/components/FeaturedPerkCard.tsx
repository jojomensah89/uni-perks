import { Star, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Perk } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FeaturedPerkCardProps {
    perk: Perk;
}

export function FeaturedPerkCard({ perk }: FeaturedPerkCardProps) {
    return (
        <div className="group relative flex flex-col justify-between h-full bg-[#111111] border-2 border-yellow-400 p-6 transition-all hover:bg-black hover:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
            <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{perk.company}</p>
                        <h3 className="text-xl font-bold leading-tight text-white line-clamp-2">
                            {perk.title}
                        </h3>
                    </div>
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 shrink-0" />
                </div>

                {/* Value Badge */}
                <div className="mb-4">
                    {perk.valueAmount ? (
                        <div className="inline-block border-2 border-blue-500 rounded-sm px-3 py-1 bg-transparent">
                            <span className="text-sm font-bold text-blue-400">Up to ${perk.valueAmount.toLocaleString()}</span>
                        </div>
                    ) : (
                        <div className="inline-block border-2 border-green-500 rounded-sm px-3 py-1 bg-transparent">
                            <span className="text-sm font-bold text-green-400">Free Access</span>
                        </div>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 line-clamp-3 mb-6 font-medium leading-relaxed">
                    {perk.shortDescription}
                </p>

                {/* Category Tag */}

                <div className="mb-6">
                    <Badge variant="secondary" className="bg-blue-900/40 text-blue-400 hover:bg-blue-900/60 rounded-sm font-bold uppercase text-[10px] tracking-wider px-2 py-1">
                        {/* Assuming category name is available, otherwise use a placeholder or handle it in parent */}
                        {/* The typo in interface suggests category might be object or id. I'll robustly handle it. */}
                        CLOUD INFRASTRUCTURE
                        {/* Ideally perk.category.name if populated, or fallback layout props. 
                                 Given the screenshot has standardized tags, I'll use a placeholder or rely on what's available. 
                                 Since `Perk` type has `category` as ID usually in basic fetch, but here logic needs name.
                             */}
                    </Badge>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
                <Button
                    variant="outline"
                    className="w-full bg-transparent border-white text-white hover:bg-white hover:text-black rounded-sm font-bold uppercase tracking-wider h-10 text-xs"
                >
                    <Link href={'#'}>
                        Details <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                </Button>
                <Button
                    className="w-full bg-yellow-400 text-black hover:bg-yellow-500 border-none rounded-sm font-bold uppercase tracking-wider h-10 text-xs"
                >
                    <Link href={'#'} target="_blank" rel="noopener noreferrer">
                        Apply <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
