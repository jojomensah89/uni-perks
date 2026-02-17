"use client"

import Link from "next/link"
import { Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CountrySelector } from "./CountrySelector"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/redesign" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block">
                            Uni-Perks
                        </span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link href="/redesign/perks?category=tech" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Tech
                        </Link>
                        <Link href="/redesign/perks?category=food" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Food
                        </Link>
                        <Link href="/redesign/perks?category=streaming" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Streaming
                        </Link>
                        <Link href="/redesign/perks?category=fashion" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Fashion
                        </Link>
                        <Link href="/redesign/perks?category=travel" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Travel
                        </Link>
                    </nav>
                </div>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger>
                        <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="pr-0">
                        <Link href="/redesign" className="flex items-center">
                            <span className="font-bold">Uni-Perks</span>
                        </Link>
                        <nav className="flex flex-col gap-4 mt-8">
                            <Link href="/redesign/perks?category=tech">Tech</Link>
                            <Link href="/redesign/perks?category=food">Food</Link>
                            <Link href="/redesign/perks?category=streaming">Streaming</Link>
                            <Link href="/redesign/perks?category=fashion">Fashion</Link>
                            <Link href="/redesign/perks?category=travel">Travel</Link>
                        </nav>
                    </SheetContent>
                </Sheet>

                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search deals..." className="pl-8 w-full md:w-[300px]" />
                        </div>
                    </div>
                    <div className="hidden md:flex">
                        <CountrySelector />
                    </div>
                    <Button>Suggest a Deal</Button>
                </div>
            </div>
        </header>
    )
}
