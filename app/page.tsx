import { MotionConfig } from "framer-motion";
import GuidedTour from "@/components/layout/GuidedTour";
import SiteHeader from "@/components/layout/SiteHeader";
import RoadmapScrollFix from "@/components/layout/RoadmapScrollFix";
import Hero from "@/sections/home/Hero";
import HeroArtboard from "@/sections/home/HeroArtboard";
import ProductReveal from "@/sections/home/ProductReveal";
import RoleSplit from "@/sections/home/RoleSplit";
import StageJourney from "@/sections/home/StageJourney";
import TrustAndTransparency from "@/sections/home/TrustAndTransparency";
import FAQ from "@/sections/home/FAQ";
import Footer from "@/sections/home/Footer";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <SiteHeader />
      <RoadmapScrollFix />

      <main className="bg-[var(--background)] text-[var(--foreground)]">
        <HeroArtboard />
        <Hero />
        <ProductReveal />
        <RoleSplit />
        <StageJourney />
        <TrustAndTransparency />
        <FAQ />
      </main>

      <Footer />
      <GuidedTour />
    </MotionConfig>
  );
}
