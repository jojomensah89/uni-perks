import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="container py-10 md:py-16">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/redesign" className="flex items-center space-x-2">
                            <span className="text-xl font-bold">Uni-Perks</span>
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground">
                            The best student perks. Zero sign-up.
                            We find the hidden student discounts so you don't have to.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium">Categories</h3>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/redesign/perks?category=tech">Tech & Software</Link></li>
                            <li><Link href="/redesign/perks?category=food">Food & Delivery</Link></li>
                            <li><Link href="/redesign/perks?category=streaming">Streaming</Link></li>
                            <li><Link href="/redesign/perks?category=fashion">Fashion</Link></li>
                            <li><Link href="/redesign/perks?category=travel">Travel</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium">Resources</h3>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#">How it Works</Link></li>
                            <li><Link href="#">Suggest a Deal</Link></li>
                            <li><Link href="#">Chrome Extension</Link></li>
                            <li><Link href="#">About Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium">Legal</h3>
                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#">Privacy Policy</Link></li>
                            <li><Link href="#">Terms & Conditions</Link></li>
                            <li><Link href="#">Accessibility</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 border-t pt-8">
                    <p className="text-center text-xs text-muted-foreground">
                        &copy; 2026 Uni-Perks. Made for students, by students.
                    </p>
                </div>
            </div>
        </footer>
    )
}
