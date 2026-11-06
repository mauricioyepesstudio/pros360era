"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { approveApplicationProfileAction, updateApplicationStatusAction } from "@/app/(account)/actions";
import { approvalLabels } from "@/lib/admin/profile-approval";
import type { ProfessionalApplicationRow } from "@/lib/admin/persistence";

const statusLabel: Record<ProfessionalApplicationRow["status"], string> = {
  PENDING: "Pendiente",
  REVIEWED: "Revisada",
  CONTACTED: "Contactada",
};

const statusToBadge: Record<ProfessionalApplicationRow["status"], "current" | "upcoming" | "complete"> = {
  PENDING: "current",
  REVIEWED: "upcoming",
  CONTACTED: "complete",
};

function ApplicationRow({ application }: { application: ProfessionalApplicationRow }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [approved, setApproved] = useState(false);
  const [message, setMessage] = useState("");
  const approvalState = approved ? "APPROVED" : application.approvalState;
  function approve() {
    startTransition(async () => {
      setMessage("");
      try {
        const result = await approveApplicationProfileAction(application.id);
        setMessage(result.message);
        if (result.saved) {setApproved(true); setConfirming(false);}
      } catch {setMessage("No se pudo confirmar la aprobación. Actualiza la página");}
    });
  }

  function setStatus(status: ProfessionalApplicationRow["status"]) {
    startTransition(async () => {
      setMessage("");
      try {
        const result = await updateApplicationStatusAction(application.id, status);
        if (!result.saved) setMessage("No se pudo guardar el estado de la solicitud");
      } catch {setMessage("No se pudo confirmar el cambio. Actualiza la página");}
    });
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-[var(--brand-navy)]">{application.fullName}</p>
          <p className="text-sm text-[var(--muted)]">{application.email}</p>
        </div>
        <StatusBadge status={statusToBadge[application.status]}>{statusLabel[application.status]}</StatusBadge>
      </div>

      <div className="mt-3 grid gap-1 text-sm text-[var(--muted)] sm:grid-cols-2">
        {application.phone && <p><span className="font-semibold text-[var(--brand-navy)]">Teléfono:</span> {application.phone}</p>}
        {application.city && <p><span className="font-semibold text-[var(--brand-navy)]">Ciudad:</span> {application.city}</p>}
        <p><span className="font-semibold text-[var(--brand-navy)]">Categoría:</span> {application.categoryOfInterest}</p>
        {application.credentialInfo && <p><span className="font-semibold text-[var(--brand-navy)]">Credencial:</span> {application.credentialInfo}</p>}
      </div>

      {application.bio && <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{application.bio}</p>}
      {application.notes && <p className="mt-2 text-sm italic leading-6 text-[var(--muted)]">&ldquo;{application.notes}&rdquo;</p>}

      <section className="mt-4 rounded-[var(--radius-lg)] border border-[var(--border)] p-4" aria-label="Aprobación del perfil profesional">
        <p className="text-sm font-semibold text-[var(--brand-navy)]">{approvalLabels[approvalState]}</p>
        {approvalState === "APPROVABLE" && (
          confirming ? <div className="mt-3 space-y-3">
            <p className="text-sm text-[var(--muted)]">¿Aprobar el perfil vinculado a {application.email}? Podrá aparecer entre los profesionales aprobados. Esto no verifica su identidad ni sus credenciales.</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={pending} onClick={approve}>{pending ? "Guardando…" : "Confirmar aprobación"}</Button>
              <Button type="button" variant="secondary" disabled={pending} onClick={() => setConfirming(false)}>Cancelar</Button>
            </div>
          </div> : <Button type="button" variant="secondary" disabled={pending} onClick={() => setConfirming(true)}>Aprobar perfil profesional</Button>
        )}
        <p className="mt-2 text-sm text-[var(--muted)]">La aprobación del perfil es independiente de la revisión y el contacto de esta solicitud.</p>
        {message && <p className="mt-2 text-sm text-[var(--brand-navy)]" role="status">{message}</p>}
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        {application.status !== "REVIEWED" && (
          <Button type="button" variant="secondary" disabled={pending} onClick={() => setStatus("REVIEWED")}>
            Marcar revisada
          </Button>
        )}
        {application.status !== "CONTACTED" && (
          <Button type="button" disabled={pending} onClick={() => setStatus("CONTACTED")}>
            Marcar contactada
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ApplicationsTable({ applications }: { applications: ProfessionalApplicationRow[] }) {
  if (applications.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-8 text-center">
        <p className="text-[var(--muted)]">Todavía no hay aplicaciones de profesionales.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <ApplicationRow key={application.id} application={application} />
      ))}
    </div>
  );
}
