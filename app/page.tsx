import { MotionConfig } from "framer-motion";
import GuidedTour from "@/components/layout/GuidedTour";
import SiteHeader from "@/components/layout/SiteHeader";
import HeroArtboard from "@/sections/home/HeroArtboard";
import TrustStrip from "@/sections/home/TrustStrip";
import StageJourney from "@/sections/home/StageJourney";
import ThreeSteps from "@/sections/home/ThreeSteps";
import ExplainerVideos from "@/sections/home/ExplainerVideos";
import ProBand from "@/sections/home/ProBand";
import Footer from "@/sections/home/Footer";

/**
 * Home (owner-approved mockup v6, 3-nov): full-bleed photos, no framed
 * cards, sections told apart by the three brand colors (white, red, navy).
 */
export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <SiteHeader />

      <main className="bg-white pt-24 text-[var(--foreground)]">
        <HeroArtboard />
        <TrustStrip />
        <ExplainerVideos />
        <StageJourney />
        <ThreeSteps />
        <ProBand />
      </main>

      <Footer />
      <GuidedTour />
    </MotionConfig>
  );
}
