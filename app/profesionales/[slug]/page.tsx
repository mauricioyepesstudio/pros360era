import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/sections/home/Footer";
import ProfessionalProfileView from "@/components/professional/ProfessionalProfileView";
import { getPublicProfessionalBySlug, getPublicWorkSamples } from "@/lib/professional/public-profile";
import { brand } from "@/config/brand";

/**
 * Public EVOLUSA professional trust profile — reads ONLY
 * professional_profiles_public and professional_work_samples_public (see
 * lib/professional/public-profile.ts). Renders real data only: no
 * fabricated ratings, verification badges, licenses, prices, or
 * availability. Appointments/Match/Verified don't exist yet, so the only
 * CTA here is a real, existing link. Photo, portfolio/website/social
 * links, and work samples all come straight from the professional's own
 * row (0017) — no fixture, no contactEmail (that stays reserved for the
 * matching-engine consent flow, never a public mailto link here).
 */

type ProfessionalPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProfessionalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const professional = await getPublicProfessionalBySlug(slug);
  if (!professional) return {};

  return {
    title: `${professional.displayName} | ${brand.displayName}`,
    description: professional.headline ?? `${professional.displayName} en la red de profesionales de ${brand.displayName}.`,
  };
}

export default async function ProfessionalProfilePage({ params }: ProfessionalPageProps) {
  const { slug } = await params;
  const professional = await getPublicProfessionalBySlug(slug);
  if (!professional) notFound();

  const workSamples = await getPublicWorkSamples(slug);

  return (
    <>
      <SiteHeader />
      <ProfessionalProfileView
        professional={professional}
        workSamples={workSamples.map((sample) => ({
          title: sample.title,
          image: sample.imageUrl,
          description: sample.description ?? undefined,
        }))}
      />
      <Footer />
    </>
  );
}
