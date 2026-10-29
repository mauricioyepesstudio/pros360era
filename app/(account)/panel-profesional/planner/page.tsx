import PlannerAlerts from "@/components/professional/PlannerAlerts";
import {professionalToday} from "@/lib/professional-planner/reminders";
import {getMyProfessionalBusiness} from "@/lib/professional-business/persistence";
import { weeklyPlannerSuggestions } from "@/lib/professional-planner/weekly-review";
import PageHeader from "@/components/account/PageHeader";
import PublicationPlanner, { type PlannerImageOption } from "@/components/professional/PublicationPlanner";
import { creativeFormatLabels, creativeSrc } from "@/data/professional/prepared-kits";
import { requireProfessionalArea } from "@/lib/account/role-gate";
import { getMyPreparedKit } from "@/lib/professional/prepared-kit";
import { getMyProfessionalPlanner } from "@/lib/professional-planner/persistence";
import { getMyProfessionalProfile } from "@/lib/professional/self-profile";
import { plannerSuggestions } from "@/lib/professional-planner/suggestions";

/**
 * Publication planner: the professional's private content calendar. Posts
 * marked ready for Instagram or Facebook go out on their own once the
 * professional has connected that network in Redes (lib/professional-planner/publisher.ts).
 */
export default async function ProfessionalPlannerPage({ searchParams }: { searchParams: Promise<{ review?: string }> }) {
  await requireProfessionalArea();
  const openSuggestions = (await searchParams).review === "weekly";
  const today = professionalToday();
  const [result, kit, profile, business] = await Promise.all([getMyProfessionalPlanner(today), getMyPreparedKit(), getMyProfessionalProfile(), getMyProfessionalBusiness()]);
  const imageOptions: PlannerImageOption[] = kit
    ? kit.creatives.concepts.flatMap((concept) =>
        kit.creatives.formats.map((format) => ({ src: creativeSrc(kit, concept.id, format), label: `${concept.title} · ${creativeFormatLabels[format]}` })),
      )
    : [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Panel profesional"
        title="Planner de publicaciones"
        description="Organiza qué vas a publicar y cuándo. Con tu Instagram y tu Facebook conectados, lo que marques «Listo para publicar» sale solo a su hora."
      />
      <PlannerAlerts planner={result} today={today} instagram={profile?.socialLinks.instagram} />
      {result.available ? (
        <PublicationPlanner key={openSuggestions ? "weekly-review" : "calendar"} openSuggestions={openSuggestions} initial={result.planner} networks={result.networks} publications={result.publications} saved={result.saved} proposedFromKit={result.proposedFromKit} today={today} imageOptions={imageOptions} suggestions={[...weeklyPlannerSuggestions(profile?{...profile,business:business.business}:null, today), ...plannerSuggestions(kit, profile?.displayName ?? null)]} />
      ) : (
        <p role="alert" className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
          No pudimos abrir tu planner. Necesitas un perfil profesional propio; reintenta más tarde.
        </p>
      )}
    </div>
  );
}
