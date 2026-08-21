import SiteHeader from "@/components/layout/SiteHeader";
import Hero from "@/sections/home/Hero";
import StageSelector from "@/sections/home/StageSelector";
import JourneyOverview from "@/sections/home/JourneyOverview";
import StageServices from "@/sections/home/StageServices";
import RoadmapPreview from "@/sections/home/RoadmapPreview";
import HowItWorks from "@/sections/home/HowItWorks";
import TrustAndTransparency from "@/sections/home/TrustAndTransparency";
import FAQ from "@/sections/home/FAQ";
import CTA from "@/sections/home/CTA";
import Footer from "@/sections/home/Footer";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="bg-slate-50 text-slate-950">
        <Hero />
        <StageSelector />
        <JourneyOverview />
        <StageServices />
        <RoadmapPreview />
        <HowItWorks />
        <TrustAndTransparency />
        <FAQ />
        <CTA />
      </main>

      <Footer />
    </>
  );
}
