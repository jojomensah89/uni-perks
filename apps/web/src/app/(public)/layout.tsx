import { SiteHeader } from "@/components/SiteHeader";
import { FooterSection } from "@/components/FooterSection";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SiteHeader />
            <main>{children}</main>
            <FooterSection />
        </>
    );
}
