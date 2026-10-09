import Link from "next/link";
import PageHeader from "@/components/account/PageHeader";
import PreparedKitCreatives from "@/components/professional/PreparedKitCreatives";
import { requireProfessionalArea } from "@/lib/account/role-gate";
import { getMyPreparedKit } from "@/lib/professional/prepared-kit";

/**
 * Creative planner: the professional's own campaign pieces, by concept and
 * format. Downloads only; nothing here schedules or publishes anything.
 */
export default async function ProfessionalCreativesPage() {
  await requireProfessionalArea();
  const kit = await getMyPreparedKit();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Panel profesional"
        title="Tus creativos"
        description="Piezas organizadas por concepto y formato para que las revises antes de usarlas. Desde aquí no se publica ni se programa nada."
      />

      {!kit ? (
        <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
          <p className="leading-7 text-[var(--muted)]">
            Todavía no tienes creativos preparados. Cuando el equipo de EVOLUSA te prepare piezas, aparecerán aquí. <Link className="underline" href="/panel-profesional">Volver al panel</Link>
          </p>
        </section>
      ) : (
        <PreparedKitCreatives kit={kit} />
      )}
    </div>
  );
}
