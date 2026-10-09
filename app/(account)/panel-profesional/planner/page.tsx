import PageHeader from "@/components/account/PageHeader";
import PublicationPlanner, { type PlannerImageOption } from "@/components/professional/PublicationPlanner";
import { creativeFormatLabels, creativeSrc } from "@/data/professional/prepared-kits";
import { requireProfessionalArea } from "@/lib/account/role-gate";
import { getMyPreparedKit } from "@/lib/professional/prepared-kit";
import { getMyProfessionalPlanner } from "@/lib/professional-planner/persistence";
import { getMyPublishingState } from "@/lib/social/connections";

/**
 * Publication planner: the professional's private content calendar. A saved
 * post can go out to their connected Instagram or LinkedIn only when they
 * press "Publicar ahora" (app/api/social/publish); nothing is published on a
 * schedule or without them.
 */
export default async function ProfessionalPlannerPage() {
  await requireProfessionalArea();
  const today = new Date().toISOString().slice(0, 10);
  const [result, kit, publishing] = await Promise.all([getMyProfessionalPlanner(today), getMyPreparedKit(), getMyPublishingState()]);
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
        description="Organiza qué vas a publicar y cuándo. Cuando una publicación esté lista, puedes publicarla en tu Instagram o LinkedIn desde aquí. Nada sale sin que tú lo pidas."
      />
      {result.available ? (
        <PublicationPlanner initial={result.planner} saved={result.saved} proposedFromKit={result.proposedFromKit} today={today} imageOptions={imageOptions} publishing={publishing} />
      ) : (
        <p role="alert" className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
          No pudimos abrir tu planner. Necesitas un perfil profesional propio; reintenta más tarde.
        </p>
      )}
    </div>
  );
}
