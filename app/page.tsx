import { MotionConfig } from "framer-motion";
import SiteHeader from "@/components/layout/SiteHeader";
import RoadmapScrollFix from "@/components/layout/RoadmapScrollFix";
import EvolusaIntroSelector from "@/components/EvolusaIntroSelector";
import Hero from "@/sections/home/Hero";
import HeroArtboard from "@/sections/home/HeroArtboard";
import UserJourneyFlow from "@/sections/home/UserJourneyFlow";
import ProfessionalJourneyFlow from "@/sections/home/ProfessionalJourneyFlow";
import ProductReveal from "@/sections/home/ProductReveal";
import JourneyOverview from "@/sections/home/JourneyOverview";
import LifeStory from "@/sections/home/LifeStory";
import StageSelector from "@/sections/home/StageSelector";
import StageServices from "@/sections/home/StageServices";
import HowItWorks from "@/sections/home/HowItWorks";
import TrustAndTransparency from "@/sections/home/TrustAndTransparency";
import FAQ from "@/sections/home/FAQ";
import CTA from "@/sections/home/CTA";
import Footer from "@/sections/home/Footer";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <SiteHeader />
      <RoadmapScrollFix />

      <main className="bg-[var(--background)] text-[var(--foreground)]">
        <div className="container mx-auto px-4 py-8">
          <EvolusaIntroSelector />
        </div>
        <HeroArtboard />
        <Hero />
        <ProductReveal />
        <UserJourneyFlow />
        <ProfessionalJourneyFlow />
        <JourneyOverview />
        <LifeStory />
        <StageSelector />
        <StageServices />
        <HowItWorks />
        <TrustAndTransparency />
        <FAQ />
        <CTA />
      </main>

      <Footer />
    </MotionConfig>
  );
}
