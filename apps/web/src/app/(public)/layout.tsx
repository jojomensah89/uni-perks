import { SiteHeader } from "@/components/SiteHeader";
import { FooterSection } from "@/components/FooterSection";
import TickerBar from "@/components/TickerBar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="sticky top-0 z-50">
                <TickerBar />
                <SiteHeader />
            </div>
            <main>{children}</main>
            <FooterSection />
        </>
    );
}
