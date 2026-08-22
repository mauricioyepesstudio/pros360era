import { MotionConfig } from "framer-motion";
import SiteHeader from "@/components/layout/SiteHeader";
import Hero from "@/sections/home/Hero";
import HeroArtboard from "@/sections/home/HeroArtboard";
import StageSelector from "@/sections/home/StageSelector";
import ProductReveal from "@/sections/home/ProductReveal";
import JourneyOverview from "@/sections/home/JourneyOverview";
import LifeStory from "@/sections/home/LifeStory";
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

      <main className="bg-[var(--background)] text-[var(--foreground)]">
        <HeroArtboard />
        <Hero />
        <StageSelector />
        <ProductReveal />
        <JourneyOverview />
        <LifeStory />
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
