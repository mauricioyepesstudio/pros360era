import { MotionConfig } from "framer-motion";
import { redirect } from "next/navigation";
import GuidedTour from "@/components/layout/GuidedTour";
import SiteHeader from "@/components/layout/SiteHeader";
import HomeRoleBar from "@/sections/home/HomeRoleBar";
import HeroArtboard from "@/sections/home/HeroArtboard";
import TrustStrip from "@/sections/home/TrustStrip";
import StageJourney from "@/sections/home/StageJourney";
import ThreeSteps from "@/sections/home/ThreeSteps";
import ExplainerVideo from "@/sections/home/ExplainerVideos";
import UserBenefits from "@/sections/home/UserBenefits";
import ProBand from "@/sections/home/ProBand";
import Footer from "@/sections/home/Footer";
import AccountRoleProvider from "@/components/layout/AccountRoleProvider";
import { getPublicAccount } from "@/lib/account/public-account";
import { PROFESSIONAL_PUBLIC_HOME, publicSideFor } from "@/lib/account/navigation";

// Per request: the page depends on who is signed in.
export const dynamic = "force-dynamic";

/**
 * The usuario home (owner, 13-nov): only what a usuario gets. Hero, one card
 * per benefit, the usuario video, the 6 etapas and how to start. The
 * profesional side lives at /para-profesionales; a signed-out visitor only
 * gets a small door to it at the end.
 */
export default async function Home() {
  // A profesional's home is the professional page; a usuario's shows only
  // the usuario system. Signed out, side is null: both doors stay open.
  const account = await getPublicAccount();
  const side = publicSideFor(account.role, account.view);
  if (side === "professional") redirect(PROFESSIONAL_PUBLIC_HOME);

  return (
    <AccountRoleProvider account={account}>
    <MotionConfig reducedMotion="user">
      <SiteHeader />

      <main className="bg-white pt-24 text-[var(--foreground)]">
        <HomeRoleBar />
        <HeroArtboard showProLink={side === null} />
        <TrustStrip />
        <UserBenefits />
        <ExplainerVideo kind="usuario" />
        <StageJourney />
        <ThreeSteps />
        {side === null && <ProBand />}
      </main>

      <Footer />
      <GuidedTour />
    </MotionConfig>
    </AccountRoleProvider>
  );
}
