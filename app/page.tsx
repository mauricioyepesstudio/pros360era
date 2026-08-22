import { MotionConfig } from "framer-motion";
import SiteHeader from "@/components/layout/SiteHeader";
import Hero from "@/sections/home/Hero";
import HeroDesktopLock from "@/sections/home/HeroDesktopLock";
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
      {/*
        TEMPORARY desktop visual lock (see HeroDesktopLock.tsx): at `lg`+,
        Header + Hero + Path + Product Reveal render as the owner-approved
        reference image with real link overlays, instead of the live
        components. Mobile/tablet render the real, fully functional
        SiteHeader/Hero/ProductReveal, completely unchanged from before —
        StageSelector is NOT duplicated: it stays mounted exactly once, in
        its original position in the flow, unconditionally. Because Hero
        and ProductReveal (its neighbors) collapse to zero height via
        `lg:hidden` on desktop, StageSelector visually lands immediately
        after the locked image and immediately before Journey — no
        reordering, no duplicate mount.
      */}
      <div className="lg:hidden">
        <SiteHeader />
      </div>

      <div className="hidden lg:block">
        <HeroDesktopLock />
      </div>

      <main className="bg-[var(--background)] text-[var(--foreground)]">
        <div className="lg:hidden">
          <Hero />
        </div>
        <StageSelector />
        <div className="lg:hidden">
          <ProductReveal />
        </div>
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
