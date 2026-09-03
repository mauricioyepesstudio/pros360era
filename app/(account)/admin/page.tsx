import { redirect } from "next/navigation";
import PageHeader from "@/components/account/PageHeader";
import ApplicationsTable from "@/components/admin/ApplicationsTable";
import { getCurrentRole } from "@/lib/account/persistence";
import { getAdminDashboardStats, getProfessionalApplications } from "@/lib/admin/persistence";

/**
 * Page-level role gate — a UX nicety, not the real security boundary.
 * admin_dashboard_stats() and admin_list_professional_applications() (0016)
 * both re-check profiles.role = 'ADMIN' from auth.uid() themselves; a
 * non-admin account calling either directly gets a rejected RPC call, not a
 * leak. This redirect just keeps a non-admin from landing on an
 * always-erroring page.
 */
export default async function AdminPage() {
  const role = await getCurrentRole();
  if (role !== "ADMIN") redirect("/dashboard");

  const [stats, applications] = await Promise.all([
    getAdminDashboardStats(),
    getProfessionalApplications(),
  ]);

  const pending = applications.filter((application) => application.status === "PENDING");
  const reviewed = applications.filter((application) => application.status !== "PENDING");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Panel de administrador"
        title="EVOLUSA en números"
        description="Miembros, profesionales y aplicaciones pendientes de revisión."
      />

      {stats && (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard label="Miembros" value={stats.totalMembers} />
          <StatCard label="Profesionales aprobados" value={stats.totalProfessionalsApproved} />
          <StatCard label="Aplicaciones pendientes" value={stats.pendingApplications} />
          <StatCard label="Conexiones totales" value={stats.totalOpportunities} />
          <StatCard label="Emparejadas" value={stats.routedOpportunities} />
          <StatCard label="Contactadas" value={stats.contactedOpportunities} />
          <StatCard label="Completadas" value={stats.completedOpportunities} />
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-[var(--brand-navy)]">Aplicaciones pendientes ({pending.length})</h2>
        <div className="mt-4">
          <ApplicationsTable applications={pending} />
        </div>
      </div>

      {reviewed.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[var(--brand-navy)]">Ya revisadas ({reviewed.length})</h2>
          <div className="mt-4">
            <ApplicationsTable applications={reviewed} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
      <p className="text-2xl font-bold text-[var(--brand-navy)]">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</p>
    </div>
  );
}
