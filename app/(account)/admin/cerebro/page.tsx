import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/account/PageHeader";
import JarvisBrain from "@/components/admin/JarvisBrain";
import { getCurrentRole } from "@/lib/account/persistence";
import { getAdminDashboardStats } from "@/lib/admin/persistence";
import { BRAIN_MODULES, brainDayKey, launchReadiness, tasksForDay } from "@/lib/admin/jarvis";

export const metadata = { title: "Cerebro EVOLUSA · Admin" };

/** Same page-level gate as /admin; the stats RPC re-checks ADMIN itself. */
export default async function AdminBrainPage() {
  const role = await getCurrentRole();
  if (role !== "ADMIN") redirect("/dashboard");

  const dayKey = brainDayKey();
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Panel de administrador"
        title="Jarvis, el cerebro de EVOLUSA"
        description="Cómo está construido el proyecto, qué módulo funciona, qué lo frena y qué toca hacer hoy para avanzar."
      />

      <p>
        <Link href="/admin" className="text-sm font-semibold text-[var(--brand-blue)] hover:underline">
          ← Volver a EVOLUSA en números
        </Link>
      </p>

      <JarvisBrain modules={BRAIN_MODULES} tasks={tasksForDay(dayKey)} dayKey={dayKey} readiness={launchReadiness()} />

      {stats && (
        <div>
          <h2 className="text-lg font-bold text-[var(--brand-navy)]">Señales en vivo</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Leídas de la base de datos al abrir esta página.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Signal label="Miembros" value={stats.totalMembers} />
            <Signal label="Profesionales aprobados" value={stats.totalProfessionalsApproved} />
            <Signal label="Aplicaciones pendientes" value={stats.pendingApplications} />
            <Signal label="Conexiones totales" value={stats.totalOpportunities} />
          </div>
        </div>
      )}
    </div>
  );
}

function Signal({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
      <p className="text-2xl font-bold text-[var(--brand-navy)]">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</p>
    </div>
  );
}
