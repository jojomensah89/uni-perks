import HeroSection from "@/components/HeroSection";
import DealsGrid from "@/components/DealsGrid";
import CategoriesSection from "@/components/CategoriesSection";

export default function Home() {
  return (
    <div className="max-w-[1440px] mx-auto bg-background min-h-screen">
      <HeroSection />
      <DealsGrid />
      <CategoriesSection />
    </div>
  );
}
