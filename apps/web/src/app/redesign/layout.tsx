import { Header } from "@/components/redesign/Header"
import { Footer } from "@/components/redesign/Footer"

export default function RedesignLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    )
}
