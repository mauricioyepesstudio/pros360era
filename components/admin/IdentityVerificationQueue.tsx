"use client";

import { useState, useTransition } from "react";
import { decideIdentityVerificationAction } from "@/app/(account)/identity-actions";
import Button from "@/components/ui/Button";
import type { AdminIdentityRow, IdentityDecision } from "@/lib/professional/identity-verification";

const statusText = { NONE: "Sin documento", PENDING: "Documento pendiente", VERIFIED: "Identidad verificada", REJECTED: "Rechazada", REVOKED: "Retirada" } as const;

function Row({ row }: { row: AdminIdentityRow }) {
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState(row.status);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const evidenceUrl = status === "PENDING" ? row.evidenceUrl : null;
  const notesOk = notes.trim().length >= 12 && notes.trim().length <= 500;

  function decide(decision: IdentityDecision) {
    startTransition(async () => {
      const result = await decideIdentityVerificationAction(row.profileId, decision, notes);
      setMessage(result.message);
      if (result.saved) setStatus(decision);
    });
  }

  return (
    <li className="border-b border-[var(--border)] py-4">
      <p className="font-bold text-[var(--brand-navy)]">{row.displayName} <span className="font-normal text-[var(--muted)]">· {row.category}</span></p>
      <p className="text-sm text-[var(--muted)]">{row.email} · Perfil aprobado · <span className="font-semibold text-[var(--brand-navy)]">{statusText[status]}</span></p>
      {evidenceUrl && (
        <div className="mt-3 space-y-3">
          <a href={evidenceUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[var(--brand-red)] underline">Ver documento (enlace válido 10 min)</a>
          <label className="block text-sm font-semibold text-[var(--brand-navy)]" htmlFor={`idv-${row.profileId}`}>Nota interna: qué revisaste (mínimo 12 caracteres)</label>
          <textarea id={`idv-${row.profileId}`} value={notes} maxLength={500} onChange={(event) => setNotes(event.target.value)} className="min-h-20 w-full rounded-[var(--radius-md)] border border-[var(--border)] p-3 text-sm" />
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={pending || !notesOk} onClick={() => decide("VERIFIED")}>Marcar identidad verificada</Button>
            <Button type="button" variant="secondary" disabled={pending || !notesOk} onClick={() => decide("REJECTED")}>Rechazar</Button>
          </div>
        </div>
      )}
      {message && <p className="mt-2 text-sm text-[var(--brand-navy)]" role="status">{message}</p>}
    </li>
  );
}

export default function IdentityVerificationQueue({ rows }: { rows: AdminIdentityRow[] }) {
  if (rows.length === 0) return <p className="text-sm text-[var(--muted)]">No hay perfiles aprobados para verificar, o la migración de verificación aún no está aplicada.</p>;
  return <ul>{rows.map((row) => <Row key={row.profileId} row={row} />)}</ul>;
}
