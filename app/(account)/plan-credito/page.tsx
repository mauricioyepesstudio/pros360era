import PageHeader from "@/components/account/PageHeader";
import CreditPlanChecklist from "@/components/plans/CreditPlanChecklist";
import { creditPlanSteps } from "@/data/plans/credit-plan";
import { getCurrentProfile } from "@/lib/account/persistence";

export default async function PlanCreditoPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Plan de Crédito"
        title="Construye tu historial de crédito en Estados Unidos"
        description="Un plan paso a paso que completas tú mismo, a tu ritmo. Sin cita, sin profesional — solo lo que necesitas saber, en orden."
      />
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--sky-surface)] p-4 text-sm text-[var(--brand-navy)]">
        Disponible gratis mientras preparamos el sistema de pago. Ninguna de estas acciones requiere un profesional ni te compromete a nada — es información educativa, no asesoría financiera individualizada.
      </div>
      <CreditPlanChecklist steps={creditPlanSteps} completedIds={profile.completedTaskIds} />
    </div>
  );
}
