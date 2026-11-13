import { MotionConfig } from "framer-motion";
import { redirect } from "next/navigation";
import GuidedTour from "@/components/layout/GuidedTour";
import SiteHeader from "@/components/layout/SiteHeader";
import HomeRoleBar from "@/sections/home/HomeRoleBar";
import HeroArtboard from "@/sections/home/HeroArtboard";
import TrustStrip from "@/sections/home/TrustStrip";
import StageJourney from "@/sections/home/StageJourney";
import ThreeSteps from "@/sections/home/ThreeSteps";
import ExplainerVideos from "@/sections/home/ExplainerVideos";
import ProBand from "@/sections/home/ProBand";
import Footer from "@/sections/home/Footer";
import { getCurrentAccountIdentity } from "@/lib/account/persistence";
import { getAdminView } from "@/lib/account/role-gate";
import { getAuthReadiness } from "@/lib/auth/config";
import { PROFESSIONAL_PUBLIC_HOME, publicSideFor, type PublicSide } from "@/lib/account/navigation";

// Per request: the page depends on who is signed in.
export const dynamic = "force-dynamic";

/**
 * Which side of the site the signed-in account belongs to (owner, 13-nov):
 * a profesional's home is the professional page, a usuario's home shows only
 * the usuario system. Signed out (or preview without Supabase), null: the
 * visitor sees both sides and chooses.
 */
async function signedInSide(): Promise<PublicSide | null> {
  if (!getAuthReadiness().configured) return null;
  const identity = await getCurrentAccountIdentity();
  if (identity.status !== "ready") return null;
  return publicSideFor(identity.role, identity.role === "ADMIN" ? await getAdminView() : undefined);
}

/**
 * Home (owner-approved mockup v6, 3-nov): full-bleed photos, no framed
 * cards, sections told apart by the three brand colors (white, red, navy).
 */
export default async function Home() {
  const side = await signedInSide();
  if (side === "professional") redirect(PROFESSIONAL_PUBLIC_HOME);

  return (
    <MotionConfig reducedMotion="user">
      <SiteHeader />

      <main className="bg-white pt-24 text-[var(--foreground)]">
        <HomeRoleBar />
        <HeroArtboard />
        <TrustStrip />
        <ExplainerVideos />
        <StageJourney />
        <ThreeSteps />
        {side !== "member" && <ProBand />}
      </main>

      <Footer />
      <GuidedTour />
    </MotionConfig>
  );
}
