import PageHeader from "@/components/account/PageHeader";
import PublicationPlanner, { type PlannerImageOption } from "@/components/professional/PublicationPlanner";
import { creativeFormatLabels, creativeSrc } from "@/data/professional/prepared-kits";
import { requireProfessionalArea } from "@/lib/account/role-gate";
import { getMyPreparedKit } from "@/lib/professional/prepared-kit";
import { getMyProfessionalPlanner } from "@/lib/professional-planner/persistence";

/**
 * Publication planner: the professional's private content calendar. Posts
 * marked ready for Instagram or Facebook go out on their own once the
 * professional has connected that network in Redes (lib/professional-planner/publisher.ts).
 */
export default async function ProfessionalPlannerPage() {
  await requireProfessionalArea();
  const today = new Date().toISOString().slice(0, 10);
  const [result, kit] = await Promise.all([getMyProfessionalPlanner(today), getMyPreparedKit()]);
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
      {result.available ? (
        <PublicationPlanner initial={result.planner} networks={result.networks} publications={result.publications} saved={result.saved} proposedFromKit={result.proposedFromKit} today={today} imageOptions={imageOptions} />
      ) : (
        <p role="alert" className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
          No pudimos abrir tu planner. Necesitas un perfil profesional propio; reintenta más tarde.
        </p>
      )}
    </div>
  );
}
