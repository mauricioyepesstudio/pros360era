import { MotionConfig } from "framer-motion";
import GuidedTour from "@/components/layout/GuidedTour";
import SiteHeader from "@/components/layout/SiteHeader";
import RoadmapScrollFix from "@/components/layout/RoadmapScrollFix";
import Hero from "@/sections/home/Hero";
import HeroArtboard from "@/sections/home/HeroArtboard";
import ForMembers from "@/sections/home/ForMembers";
import ForProfessionals from "@/sections/home/ForProfessionals";
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
        <ForMembers />
        <StageJourney />
        <ForProfessionals />
        <TrustAndTransparency />
        <FAQ />
      </main>

      <Footer />
      <GuidedTour />
    </MotionConfig>
  );
}
